import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import * as exec from '@actions/exec'
import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'

const CMDLINE_TOOLS_VERSION = '3.0'
const COMMANDLINE_TOOLS_VERSION = '6858069'

const COMMANDLINE_TOOLS_WIN_URL = `https://dl.google.com/android/repository/commandlinetools-win-${COMMANDLINE_TOOLS_VERSION}_latest.zip`
const COMMANDLINE_TOOLS_MAC_URL = `https://dl.google.com/android/repository/commandlinetools-mac-${COMMANDLINE_TOOLS_VERSION}_latest.zip`
const COMMANDLINE_TOOLS_LIN_URL = `https://dl.google.com/android/repository/commandlinetools-linux-${COMMANDLINE_TOOLS_VERSION}_latest.zip`

const HOME = os.homedir()
const ANDROID_HOME_DIR = path.join(HOME, '.android')
const ANDROID_HOME_SDK_DIR = path.join(ANDROID_HOME_DIR, 'sdk')
const ANDROID_SDK_ROOT = process.env['ANDROID_SDK_ROOT'] || ANDROID_HOME_SDK_DIR
const ANDROID_REPOSITORIES_CFG = path.join(ANDROID_SDK_ROOT, 'repositories.cfg')

function getSdkManagerPath(cmdToolsVersion: string): string {
  const toolsBinDir = path.join(
    ANDROID_SDK_ROOT,
    'cmdline-tools',
    cmdToolsVersion,
    'bin'
  )
  if ('win32' === process.platform) {
    return path.join(toolsBinDir, 'sdkmanager.bat')
  }
  return path.join(toolsBinDir, 'sdkmanager')
}

function findPreinstalledSdkManager(): {
  isFound: boolean
  isCorrectVersion: boolean
  exePath: string
} {
  const result = {isFound: false, isCorrectVersion: false, exePath: ''}

  // First try to find the version defined in CMDLINE_TOOLS_VERSION
  result.exePath = getSdkManagerPath(CMDLINE_TOOLS_VERSION)
  result.isFound = fs.existsSync(result.exePath)
  if (result.isFound) {
    result.isCorrectVersion = true
    return result
  }

  // cmdline-tools could have a 'latest' version, but if it was installed 2 years ago
  // it may not be 'latest' as of today
  result.exePath = getSdkManagerPath('latest')
  result.isFound = fs.existsSync(result.exePath)
  if (result.isFound) {
    return result
  }
  result.exePath = ''

  // Find whatever version is available in ANDROID_SDK_ROOT
  const cmdlineToolsDir = path.join(ANDROID_SDK_ROOT, 'cmdline-tools')
  const foundVersions: string[] = fs.existsSync(cmdlineToolsDir)
    ? fs.readdirSync(cmdlineToolsDir)
    : []
  const foundVersionsFiltered: string[] = foundVersions.filter(
    obj => '.' !== obj && '..' !== obj
  )

  // Sort by desc, to get 2.0 first, before 1.0
  const foundVersionsSorted: string[] = foundVersionsFiltered.sort(
    (a: string, b: string) => (a > b ? -1 : 1)
  )

  for (const version of foundVersionsSorted) {
    result.exePath = getSdkManagerPath(version)
    result.isFound = fs.existsSync(result.exePath)
    if (result.isFound) {
      return result
    }
  }

  result.exePath = ''
  return result
}

async function callSdkManager(sdkManager: string, arg: string): Promise<void> {
  const acceptBuffer = Buffer.from(Array(10).fill('y').join('\n'), 'utf8')
  await exec.exec(sdkManager, [arg], {
    input: acceptBuffer
  })
}

async function installSdkManager(): Promise<string> {
  fs.mkdirSync(ANDROID_SDK_ROOT, {recursive: true})

  // touch ~/.android/repositories.cfg
  fs.closeSync(fs.openSync(ANDROID_REPOSITORIES_CFG, 'w'))

  const sdkManager = findPreinstalledSdkManager()
  if (!sdkManager.isFound) {
    let cmdlineToolsURL
    if (process.platform === 'linux') {
      cmdlineToolsURL = COMMANDLINE_TOOLS_LIN_URL
    } else if (process.platform === 'darwin') {
      cmdlineToolsURL = COMMANDLINE_TOOLS_MAC_URL
    } else if (process.platform === 'win32') {
      cmdlineToolsURL = COMMANDLINE_TOOLS_WIN_URL
    } else {
      core.error(`Unsupported platform: ${process.platform}`)
      return ''
    }
    const cmdlineToolsZip = await tc.downloadTool(cmdlineToolsURL)
    const cmdlineToolsExtractedLocation = await tc.extractZip(cmdlineToolsZip)

    // Move cmdline-tools to where it would be if it was installed through sdkmanager
    // Will allow calling sdkmanager without --sdk_root='..' argument
    const desiredLocation = path.join(
      ANDROID_SDK_ROOT,
      'cmdline-tools',
      CMDLINE_TOOLS_VERSION
    )
    fs.mkdirSync(path.dirname(desiredLocation))
    fs.renameSync(
      path.join(cmdlineToolsExtractedLocation, 'cmdline-tools'),
      desiredLocation
    )

    sdkManager.exePath = getSdkManagerPath(CMDLINE_TOOLS_VERSION)
    sdkManager.isCorrectVersion = true
  }

  if (!sdkManager.isCorrectVersion) {
    await callSdkManager(
      sdkManager.exePath,
      `cmdline-tools;${CMDLINE_TOOLS_VERSION}`
    )
    sdkManager.exePath = getSdkManagerPath(CMDLINE_TOOLS_VERSION)
  }
  return sdkManager.exePath
}

async function run(): Promise<void> {
  const sdkManager = await installSdkManager()
  core.debug(`sdkmanager installed to: ${sdkManager}`)
  await callSdkManager(sdkManager, '--licenses')
  await callSdkManager(sdkManager, 'tools')
  await callSdkManager(sdkManager, 'platform-tools')

  core.setOutput('ANDROID_COMMANDLINE_TOOLS_VERSION', COMMANDLINE_TOOLS_VERSION)
  core.exportVariable('ANDROID_HOME', ANDROID_SDK_ROOT)
  core.exportVariable('ANDROID_SDK_ROOT', ANDROID_SDK_ROOT)

  core.addPath(path.dirname(sdkManager))
  core.addPath(path.join(ANDROID_SDK_ROOT, 'platform-tools'))

  core.debug('add matchers')
  // eslint-disable-next-line no-console
  console.log(`##[add-matcher]${path.join(__dirname, '..', 'matchers.json')}`)
}

run()
