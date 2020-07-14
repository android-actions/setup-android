import * as core from '@actions/core'
import * as path from 'path'
import * as tc from '@actions/tool-cache'

const matchers = [
  'android-lint-file-matcher.json',
  'android-lint-line-matcher.json',
  'gradle-matcher.json',
  'kotlin-error-matcher.json',
  'kotlin-warning-matcher.json'
]

let tempDirectory = process.env['RUNNER_TEMP'] || ''

const IS_WINDOWS = process.platform === 'win32'

const cmdToolsVersion = '6609375'

let cmdToolsOS: string
if (process.platform === 'win32') {
  cmdToolsOS = 'win'
}
if (process.platform === 'darwin') {
  cmdToolsOS = 'mac'
}
if (process.platform === 'linux') {
  cmdToolsOS = 'linux'
}

if (!tempDirectory) {
  let baseLocation
  if (IS_WINDOWS) {
    // On windows use the USERPROFILE env variable
    baseLocation = process.env['USERPROFILE'] || 'C:\\'
  } else {
    if (process.platform === 'darwin') {
      baseLocation = '/Users'
    } else {
      baseLocation = '/home'
    }
  }
  tempDirectory = path.join(baseLocation, 'actions', 'temp')
}

async function run(): Promise<void> {
  const tempDir: string = path.join(
    tempDirectory,
    `temp_${Math.floor(Math.random() * 2000000000)}`
  )

  const androidHome = path.join(tempDir, 'android')

  const cmdToolsZip = await tc.downloadTool(
    `https://dl.google.com/android/repository/commandlinetools-${cmdToolsOS}-${cmdToolsVersion}_latest.zip`
  )

  core.debug('extract android commandlinetools')
  await tc.extractZip(cmdToolsZip, androidHome)

  core.exportVariable('ANDROID_HOME', androidHome)

  core.addPath(path.join(androidHome, 'tools', 'bin'))

  core.debug('add matchers')
  const matchersPath = path.join(__dirname, '..', '.github')
  for (const matcher of matchers) {
    console.log(`##[add-matcher]${path.join(matchersPath, matcher)}`)
  }
}

run()
