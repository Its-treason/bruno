import React, { useEffect, useState } from 'react';
import { findEnvironmentInCollection } from 'utils/collections';
import usePrevious from 'hooks/usePrevious';
import EnvironmentDetails from './EnvironmentDetails';
import CreateEnvironment from '../CreateEnvironment';
import { IconDownload, IconShieldLock } from '@tabler/icons-react';
import ImportEnvironment from '../ImportEnvironment';
import ManageSecrets from '../ManageSecrets';
import StyledWrapper from './StyledWrapper';
import ConfirmSwitchEnv from './ConfirmSwitchEnv';

const EnvironmentList = ({ selectedEnvironment, setSelectedEnvironment, collection, formik }) => {
  const { environments } = collection;
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openImportModal, setOpenImportModal] = useState(false);
  const [openManageSecretsModal, setOpenManageSecretsModal] = useState(false);

  const [switchEnvConfirmClose, setSwitchEnvConfirmClose] = useState(false);

  const envUids = environments ? environments.map((env) => env.uid) : [];
  const prevEnvUids = usePrevious(envUids);

  useEffect(() => {
    if (selectedEnvironment) {
      return;
    }

    const environment = findEnvironmentInCollection(collection, collection.activeEnvironmentUid);
    if (environment) {
      setSelectedEnvironment(environment);
    } else {
      setSelectedEnvironment(environments && environments.length ? environments[0] : null);
    }
  }, [collection, environments, selectedEnvironment]);

  useEffect(() => {
    if (prevEnvUids && prevEnvUids.length && envUids.length > prevEnvUids.length) {
      const newEnv = environments.find((env) => !prevEnvUids.includes(env.uid));
      if (newEnv) {
        setSelectedEnvironment(newEnv);
      }
    }

    if (prevEnvUids && prevEnvUids.length && envUids.length < prevEnvUids.length) {
      setSelectedEnvironment(environments && environments.length ? environments[0] : null);
    }
  }, [envUids, environments, prevEnvUids]);

  const handleEnvironmentClick = (env) => {
    if (!formik.dirty) {
      setSelectedEnvironment(env);
    } else {
      setSwitchEnvConfirmClose(env);
    }
  };

  if (!selectedEnvironment) {
    return null;
  }

  const handleCreateEnvClick = () => {
    if (!formik.dirty) {
      setOpenCreateModal(true);
    } else {
      setSwitchEnvConfirmClose(true);
    }
  };

  const handleImportClick = () => {
    if (!formik.dirty) {
      setOpenImportModal(true);
    } else {
      setSwitchEnvConfirmClose(true);
    }
  };

  const handleSecretsClick = () => {
    setOpenManageSecretsModal(true);
  };

  const handleConfirmSwitch = (saveChanges) => {
    // This will be the new env, if the dialog was opened from the switcher
    if (typeof switchEnvConfirmClose === 'object') {
      setSelectedEnvironment(switchEnvConfirmClose);
    }

    if (saveChanges) {
      formik.handleSubmit();
      setSwitchEnvConfirmClose(false);
    } else {
      setSwitchEnvConfirmClose(false);
      formik.resetForm();
    }
  };

  return (
    <StyledWrapper>
      {openCreateModal && <CreateEnvironment collection={collection} onClose={() => setOpenCreateModal(false)} />}
      {openImportModal && <ImportEnvironment collection={collection} onClose={() => setOpenImportModal(false)} />}
      {openManageSecretsModal && <ManageSecrets onClose={() => setOpenManageSecretsModal(false)} />}

      <div className="flex">
        <div>
          {switchEnvConfirmClose && (
            <div className="flex items-center justify-between tab-container px-1">
              <ConfirmSwitchEnv
                onCancel={() => setSwitchEnvConfirmClose(false)}
                onCloseWithoutSave={() => handleConfirmSwitch(false)}
                onSaveAndClose={() => handleConfirmSwitch(true)}
              />
            </div>
          )}
          <div className="environments-sidebar flex flex-col">
            {environments &&
              environments.length &&
              environments.map((env) => (
                <div
                  key={env.uid}
                  className={selectedEnvironment.uid === env.uid ? 'environment-item active' : 'environment-item'}
                  onClick={() => handleEnvironmentClick(env)}
                >
                  <span className="break-all">{env.name}</span>
                </div>
              ))}
            <div className="btn-create-environment" onClick={() => handleCreateEnvClick()}>
              + <span>Create</span>
            </div>

            <div className="mt-auto btn-import-environment">
              <div className="flex items-center" onClick={() => handleImportClick()}>
                <IconDownload size={12} strokeWidth={2} />
                <span className="label ml-1 text-xs">Import</span>
              </div>
              <div className="flex items-center mt-2" onClick={() => handleSecretsClick()}>
                <IconShieldLock size={12} strokeWidth={2} />
                <span className="label ml-1 text-xs">Managing Secrets</span>
              </div>
            </div>
          </div>
        </div>
        <EnvironmentDetails environment={selectedEnvironment} collection={collection} formik={formik} />
      </div>
    </StyledWrapper>
  );
};

export default EnvironmentList;
