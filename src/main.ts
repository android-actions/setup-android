import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import * as exec from '@actions/exec'
import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'

const COMMANDLINE_TOOLS_VERSION = '6858069'

const COMMANDLINE_TOOLS_WIN_URL = `https://dl.google.com/android/repository/commandlinetools-win-${COMMANDLINE_TOOLS_VERSION}_latest.zip`
const COMMANDLINE_TOOLS_MAC_URL = `https://dl.google.com/android/repository/commandlinetools-mac-${COMMANDLINE_TOOLS_VERSION}_latest.zip`
const COMMANDLINE_TOOLS_LIN_URL = `https://dl.google.com/android/repository/commandlinetools-linux-${COMMANDLINE_TOOLS_VERSION}_latest.zip`

const HOME = os.homedir()
const ANDROID_HOME_DIR = path.join(HOME, '.android')
const ANDROID_HOME_SDK_DIR = path.join(ANDROID_HOME_DIR, 'sdk')
const ANDROID_REPOSITORIES_CFG = path.join(ANDROID_HOME_DIR, 'repositories.cfg')

async function install(): Promise<string> {
  const ANDROID_SDK_ROOT =
    process.env['ANDROID_SDK_ROOT'] || ANDROID_HOME_SDK_DIR
  const licenseDir = path.join(ANDROID_SDK_ROOT, 'licenses')

  // If the licences exist, the rest does too
  if (fs.existsSync(licenseDir)) {
    core.debug(`Skipping install, licenseDir found: ${licenseDir}`)
    return ANDROID_SDK_ROOT
  }

  // create ~/.android/repositories.cfg
  fs.mkdirSync(ANDROID_HOME_SDK_DIR, {recursive: true})
  fs.closeSync(fs.openSync(ANDROID_REPOSITORIES_CFG, 'w'))

  const acceptBuffer = Buffer.from(Array(10).fill('y').join('\n'), 'utf8')
  let sdkManager = ''

  if (process.platform === 'linux') {
    const cmdlineToolsZip = await tc.downloadTool(COMMANDLINE_TOOLS_LIN_URL)
    const cmdlineTools = await tc.extractZip(cmdlineToolsZip)
    sdkManager = path.join(cmdlineTools, 'cmdline-tools', 'bin', 'sdkmanager')
  } else if (process.platform === 'darwin') {
    const cmdlineToolsZip = await tc.downloadTool(COMMANDLINE_TOOLS_MAC_URL)
    const cmdlineTools = await tc.extractZip(cmdlineToolsZip)
    sdkManager = path.join(cmdlineTools, 'cmdline-tools', 'bin', 'sdkmanager')
  } else if (process.platform === 'win32') {
    const cmdlineToolsZip = await tc.downloadTool(COMMANDLINE_TOOLS_WIN_URL)
    const cmdlineTools = await tc.extractZip(cmdlineToolsZip)
    sdkManager = path.join(cmdlineTools, 'cmdline-tools', 'bin', 'sdkmanager.bat')
  } else {
    core.error(`Unsupported platform: ${process.platform}`)
  }

  await exec.exec(
    sdkManager,
    ['--licenses', `--sdk_root=${ANDROID_SDK_ROOT}`],
    {input: acceptBuffer}
  )

  await exec.exec(
    sdkManager,
    ['--include_obsolete', `--sdk_root=${ANDROID_SDK_ROOT}`, 'tools'],
    {input: acceptBuffer}
  )

  return ANDROID_SDK_ROOT
}

async function run(): Promise<void> {
  const ANDROID_SDK_ROOT = await install()
  core.setOutput('ANDROID_COMMANDLINE_TOOLS_VERSION', COMMANDLINE_TOOLS_VERSION)
  core.exportVariable('ANDROID_HOME', ANDROID_SDK_ROOT)
  core.exportVariable('ANDROID_SDK_ROOT', ANDROID_SDK_ROOT)

  core.addPath(path.join(ANDROID_SDK_ROOT, 'cmdline-tools', 'bin'))
  core.addPath(path.join(ANDROID_SDK_ROOT, 'platform-tools'))

  core.debug('add matchers')
  // eslint-disable-next-line no-console
  console.log(`##[add-matcher]${path.join(__dirname, '..', 'matchers.json')}`)
}

run()
