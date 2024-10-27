import { original } from 'immer';
import { uuid } from 'utils/common';
import { createStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import { electronStorage, mapHandler } from 'utils/electronStorage';

export type GlobalEnvironment = {
  name: string;
  id: string;
  variables: {
    name: string;
    value: unknown;
    id: string;
    enabled: boolean;
    secret: boolean;
  }[];
};

type Actions = {
  setActiveEnvironment: (id: string | null) => void;

  updateGlobalVariables: (variables: Record<string, unknown>) => void;

  createEnvironment: (name: string, variables?: GlobalEnvironment['variables']) => string;
  deleteEnvironment: (id: string) => void;
  copyEnvironment: (sourceId: string, name: string) => string;
  renameEnvironment: (id: string, newName: string) => void;
  saveEnvironment: (envId: string, variables: GlobalEnvironment['variables']) => void;
};

export type GlobalEnvironmentStore = {
  activeEnvironment: string | null;
  environments: Map<string, GlobalEnvironment>;
};

export const globalEnvironmentStore = createStore(
  persist(
    immer<GlobalEnvironmentStore & Actions>((set) => ({
      activeEnvironment: null,
      environments: new Map(),

      setActiveEnvironment: (id) => {
        set((state) => {
          if (id !== null && !state.environments.has(id)) {
            throw new Error(`No environment with id "${id}" found!`);
          }
          state.activeEnvironment = id;
        });
      },

      updateGlobalVariables: (variables) => {
        set((state) => {
          const activeEnv = state.environments.get(state.activeEnvironment);
          if (!activeEnv) {
            return;
          }
          
          const entries = Object.entries(variables);
          for (const [name, value] of entries) {
            const found = activeEnv.variables.find((variable) => variable.name === name);
            if (found) {
              found.value = value;
              found.enabled = true;
              continue;
            }
            activeEnv.variables.push({
              name,
              value,
              enabled: true,
              id: uuid(),
              secret: false,
            })
          }
        });
      },

      createEnvironment: (name, variables = []) => {
        const id = uuid();
        set((state) => {
          state.environments = new Map(state.environments).set(id, {
            name,
            id,
            variables
          });
        });

        return id;
      },
      deleteEnvironment: (id) => {
        set((state) => {
          const deleted = state.environments.delete(id);
          if (!deleted) {
            throw new Error(`No environment with id "${id}" found!`);
          }

          if (state.activeEnvironment === id) {
            state.activeEnvironment = null;
          }
        });
      },
      copyEnvironment: (sourceId, name) => {
        const id = uuid();

        set((state) => {
          const sourceEnv = state.environments.get(sourceId);
          if (!sourceEnv) {
            throw new Error(`No environment with id ${sourceId} found`);
          }

          state.environments.set(id, {
            id,
            name,
            variables: structuredClone(original(sourceEnv.variables))
          });
        });

        return id;
      },
      renameEnvironment: (id, newName) => {
        set((state) => {
          const environment = state.environments.get(id);
          if (!environment) {
            throw new Error(`No environment with id ${id} found`);
          }
          environment.name = newName;
        });
      },

      saveEnvironment: (envId, variables) => {
        set((state) => {
          const environment = state.environments.get(envId);
          if (!environment) {
            throw new Error(`No environment with id ${envId} found`);
          }
          environment.variables = variables;
        });
      }
    })),
    {
      name: 'global-environment',
      version: 1,
      storage: createJSONStorage(() => electronStorage, mapHandler)
    }
  )
);
