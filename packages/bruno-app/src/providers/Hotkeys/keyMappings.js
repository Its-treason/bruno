const KeyMapping = {
  save: { mac: 'Command+s', windows: 'Ctrl+S', name: 'Save' },
  sendRequest: { mac: 'Command+Enter', windows: 'Ctrl+Enter', name: 'Send Request' },
  editEnvironment: { mac: 'command+E', windows: 'Ctrl+e', name: 'Edit Environment' },
  newRequest: { mac: 'Command+B', windows: 'Ctrl+B', name: 'New Request' },
  closeTab: { mac: 'Command+W', windows: 'Ctrl+W', name: 'Close Tab' },
  openPreferences: { mac: 'Command+,', windows: 'Ctrl+,', name: 'Open Preferences' },
  minimizeWindow: {
    mac: 'Command+Shift+Q',
    windows: 'Control+Shift+Q',
    name: 'Minimize Window'
  },
  switchToPreviousTab: {
    mac: 'Command+Pageup',
    windows: 'Ctrl+Pageup',
    name: 'Switch to Previous Tab'
  },
  switchToNextTab: {
    mac: 'Command+Pagedown',
    windows: 'Ctrl+Pagedown',
    name: 'Switch to Next Tab'
  },
  closeAllTabs: { mac: 'Command+Shift+W', windows: 'Ctrl+Shift+W', name: 'Close All Tabs' }
};

/**
 * Retrieves the key bindings for a specific operating system.
 *
 * @param {string} os - The operating system (e.g., 'mac', 'windows').
 * @returns {Object} An object containing the key bindings for the specified OS.
 */
export const getKeyBindingsForOS = (os) => {
  const keyBindings = {};
  for (const [action, { name, ...keys }] of Object.entries(KeyMapping)) {
    if (keys[os]) {
      keyBindings[action] = {
        keys: keys[os],
        name
      };
    }
  }
  return keyBindings;
};

/**
 * Retrieves the key bindings for a specific action across all operating systems.
 *
 * @param {string} action - The action for which to retrieve key bindings.
 * @returns {Object|null} An object containing the key bindings for macOS, Windows, or null if the action is not found.
 */
export const getKeyBindingsForActionAllOS = (action) => {
  const actionBindings = KeyMapping[action];

  if (!actionBindings) {
    console.warn(`Action "${action}" not found in KeyMapping.`);
    return null;
  }

  return [actionBindings.mac, actionBindings.windows];
};
