const { execSync } = require('child_process');
const path = require('path');

module.exports = async function (context) {
  if (context.electronPlatformName !== 'darwin') return;
  const appPath = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`);
  console.log(`[afterPack] Cleaning detritus from ${appPath}...`);
  execSync(`xattr -cr "${appPath}"`, { stdio: 'inherit' });

  console.log(`[afterPack] Applying deep ad-hoc code signature to ${appPath}...`);
  execSync(`codesign --force --deep --sign - "${appPath}"`, { stdio: 'inherit' });

  console.log(`[afterPack] Verifying code signature...`);
  execSync(`codesign --verify --deep --strict --verbose=2 "${appPath}"`, { stdio: 'inherit' });
  console.log(`[afterPack] Code signature successfully applied and verified!`);
};
