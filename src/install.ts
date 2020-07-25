import * as fs from 'fs'
import * as path from 'path'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as tc from '@actions/tool-cache'
import {
  ANDROID_SDK_ROOT,
  COMMANDLINE_TOOLS_LIN_URL,
  COMMANDLINE_TOOLS_MAC_URL,
  COMMANDLINE_TOOLS_WIN_URL,
  ANDROID_REPOSITORIES_CFG,
  ANDROID_REPOSITORIES_DIR
} from './constants'

export async function install(): Promise<void> {
  const licenseDir = path.join(ANDROID_SDK_ROOT, 'licenses')

  // If the licences exist, the rest does too
  if (fs.existsSync(licenseDir) && fs.existsSync(ANDROID_REPOSITORIES_CFG)) {
    core.debug(`Skipping install, licenseDir found: ${licenseDir}`)
    return
  }

  // create ~/.android/repositories.cfg
  fs.mkdirSync(ANDROID_REPOSITORIES_DIR, {recursive: true})
  fs.closeSync(fs.openSync(ANDROID_REPOSITORIES_CFG, 'w'))

  const acceptBuffer = Buffer.from(
    Array(10)
      .fill('y')
      .join('\n'),
    'utf8'
  )
  let sdkManager = ''

  if (process.platform === 'linux') {
    const cmdlineToolsZip = await tc.downloadTool(COMMANDLINE_TOOLS_LIN_URL)
    const cmdlineTools = await tc.extractZip(cmdlineToolsZip)
    sdkManager = path.join(cmdlineTools, 'tools', 'bin', 'sdkmanager')
  } else if (process.platform === 'darwin') {
    const cmdlineToolsZip = await tc.downloadTool(COMMANDLINE_TOOLS_MAC_URL)
    const cmdlineTools = await tc.extractZip(cmdlineToolsZip)
    sdkManager = path.join(cmdlineTools, 'tools', 'bin', 'sdkmanager')
  } else if (process.platform === 'win32') {
    const cmdlineToolsZip = await tc.downloadTool(COMMANDLINE_TOOLS_WIN_URL)
    const cmdlineTools = await tc.extractZip(cmdlineToolsZip)
    sdkManager = path.join(cmdlineTools, 'tools', 'bin', 'sdkmanager.bat')
  } else {
    core.error(`Unsupported platform: ${process.platform}`)
  }

  exec.exec(sdkManager, ['--licenses'], {input: acceptBuffer})

  exec.exec(
    sdkManager,
    ['--include_obsolete', `--sdk_root=${ANDROID_SDK_ROOT}`, 'tools'],
    {input: acceptBuffer}
  )
}
