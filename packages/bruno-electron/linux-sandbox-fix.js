const fs = require('fs').promises;
const path = require('path');

/**
 * Workaround for https://github.com/electron-userland/electron-builder/issues/5371
 * from https://github.com/jitsi/jitsi-meet-electron/commit/4cc851dc75ec15fdb054aa46e4132d8fbfa3a9e5
 * use as "afterPack": "./linux-sandbox-fix.js" in build section of package.json
 */
async function afterPack({ appOutDir, electronPlatformName }) {
  if (electronPlatformName !== 'linux') {
    return;
  }

  const appName = 'bruno-lazer';
  const script = `#!/bin/bash
if [[ -f "/opt/Bruno lazer/bruno-lazer.bin" ]]; then
    "/opt/Bruno lazer/bruno-lazer.bin" --no-sandbox "$@"
else
    "\${BASH_SOURCE%/*}"/bruno-lazer.bin --no-sandbox "$@"
fi`;
  const scriptPath = path.join(appOutDir, appName);

  await fs.rename(scriptPath, `${scriptPath}.bin`);
  await fs.writeFile(scriptPath, script);
  await fs.chmod(scriptPath, 0o755);
}

module.exports = afterPack;
