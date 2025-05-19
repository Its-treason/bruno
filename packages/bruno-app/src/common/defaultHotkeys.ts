import { HotkeysSchema } from '@usebruno/schema';

export const defaultHotkeys: HotkeysSchema = {
  save: 'ctrl+s',
  sendRequest: 'ctrl+enter',
  editEnvironment: 'ctrl+e',
  newRequest: 'ctrl+b',
  minimizeWindow: 'ctrl+shift+q',
  openPreferences: 'ctrl+,',
  openCookies: 'ctrl+c',

  closeTab: 'ctrl+w',
  closeAllTabs: 'ctrl+shift+w',
  switchToPreviousTab: 'ctrl+pageup',
  switchToNextTab: 'ctrl+pagedown'
};

export const defaultHotkeysMac: HotkeysSchema = {
  save: 'command+s',
  sendRequest: 'command+enter',
  editEnvironment: 'command+e',
  newRequest: 'command+b',
  minimizeWindow: 'command+shift+q',
  openPreferences: 'command+,',
  openCookies: 'command+c',

  closeTab: 'command+w',
  closeAllTabs: 'command+shift+w',
  switchToPreviousTab: 'command+pageup',
  switchToNextTab: 'command+pagedown'
};

export const hotkeyDisplayNames: HotkeysSchema = {
  save: 'Save',
  sendRequest: 'Send Request',
  editEnvironment: 'Edit Environments',
  newRequest: 'New Request',
  minimizeWindow: 'Close Window',
  openPreferences: 'Open Preferences',
  openCookies: 'Open Cookies',

  closeTab: 'Close Tab',
  closeAllTabs: 'Close all Tabs',
  switchToPreviousTab: 'Switch to previous Tab',
  switchToNextTab: 'Switch to next Tab'
};
