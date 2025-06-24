require('dotenv').config({ path: process.env.DOTENV_PATH });

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  appId: 'com.usebruno-lazer.app',
  productName: 'Bruno lazer',
  directories: {
    buildResources: 'resources',
    output: 'out'
  },
  afterSign: 'notarize.js',
  afterPack: './linux-sandbox-fix.js',
  compression: 'maximum',
  mac: {
    artifactName: 'bruno-lazer_nightly_${arch}_${os}.${ext}',
    category: 'public.app-category.developer-tools',
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64']
      },
      {
        target: 'zip',
        arch: ['x64', 'arm64']
      }
    ],
    icon: 'resources/icons/mac/icon.icns',
    hardenedRuntime: true,
    identity: 'Anoop MD (W7LPPWA48L)',
    entitlements: 'resources/entitlements.mac.plist',
    entitlementsInherit: 'resources/entitlements.mac.plist'
  },
  linux: {
    artifactName: 'bruno-lazer_nightly_${arch}_linux.${ext}',
    icon: 'resources/icons/png',
    executableName: 'bruno-lazer',
    target: ['AppImage', 'deb', 'snap', 'rpm'],
    category: 'Development',
    synopsis: 'Lightweight client for testing and documenting API'
  },
  snap: {
    compression: 'lzo'
  },
  win: {
    target: ['nsis'],
    artifactName: 'bruno-lazer_nightly_${arch}_win.${ext}',
    icon: 'resources/icons/png'
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    allowElevation: true,
    createDesktopShortcut: false,
    createStartMenuShortcut: false,
    runAfterFinish: true,
    deleteAppDataOnUninstall: true
  },
  publish: []
};

module.exports = config;
