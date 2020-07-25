import * as os from 'os'
import * as path from 'path'

export const ANNOTATION_MATCHERS = [
  'android-lint-file-matcher.json',
  'android-lint-line-matcher.json',
  'gradle-matcher.json',
  'kotlin-error-matcher.json',
  'kotlin-warning-matcher.json'
]

export const HOME = os.homedir()

// Gradle constants
// For caching the gradle cache in ~/.gradle/cache
export const GRADLE_CACHE_GLOB = [
  '**/*.gradle',
  '**.gradle',
  'gradle.properties'
]
export const GRADLE_CACHE_DIR = path.join(HOME, '.gradle', 'cache')
export const GRADLE_CACHE_KEY = 'GRADLE_CACHE_KEY'

// For caching the gradle wrapper in ~/.gradle/wrapper
export const GRADLE_WRAPPER_GLOB = ['gradle/wrapper/**', 'gradlew*']
export const GRADLE_WRAPPER_DIR = path.join(HOME, '.gradle', 'wrapper')
export const GRADLE_WRAPPER_KEY = 'GRADLE_WRAPPER_KEY'

// Android constants
export const ANDROID_SDK_ROOT = path.join(HOME, 'android')
export const ANDROID_GLOB = GRADLE_CACHE_GLOB
export const ANDROID_KEY = 'ANDROID_KEY'

export const COMMANDLINE_TOOLS_VERSION = '6609375'
export const COMMANDLINE_TOOLS_WIN_URL = `https://dl.google.com/android/repository/commandlinetools-win-${COMMANDLINE_TOOLS_VERSION}_latest.zip`
export const COMMANDLINE_TOOLS_MAC_URL = `https://dl.google.com/android/repository/commandlinetools-mac-${COMMANDLINE_TOOLS_VERSION}_latest.zip`
export const COMMANDLINE_TOOLS_LIN_URL = `https://dl.google.com/android/repository/commandlinetools-linux-${COMMANDLINE_TOOLS_VERSION}_latest.zip`
