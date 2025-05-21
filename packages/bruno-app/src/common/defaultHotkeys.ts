import { HotkeysSchema } from '@usebruno/schema';

export const defaultHotkeys: HotkeysSchema = {
  save: 'ctrl+s',
  sendRequest: 'ctrl+enter',
  editEnvironment: 'ctrl+e',
  newRequest: 'ctrl+b',
  minimizeWindow: 'ctrl+shift+q',
  openPreferences: 'ctrl+,',
  openCookies: 'ctrl+alt+c',

  closeTab: 'ctrl+w',
  closeAllTabs: 'ctrl+shift+w',
  switchToPreviousTab: 'ctrl+pageup',
  switchToNextTab: 'ctrl+pagedown'
};

export const defaultHotkeysMac: HotkeysSchema = {
  save: 'mod+s',
  sendRequest: 'mod+enter',
  editEnvironment: 'mod+e',
  newRequest: 'mod+b',
  minimizeWindow: 'mod+shift+q',
  openPreferences: 'mod+,',
  openCookies: 'mod+alt+c',

  closeTab: 'mod+w',
  closeAllTabs: 'mod+shift+w',
  switchToPreviousTab: 'mod+pageup',
  switchToNextTab: 'mod+pagedown'
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
