import * as glob from '@actions/glob'
import * as cache from '@actions/cache'
import * as core from '@actions/core'
import * as crypto from 'crypto'
import * as fs from 'fs'
import {platform} from 'os'
import {
  GRADLE_WRAPPER_GLOB,
  GRADLE_CACHE_GLOB,
  GRADLE_WRAPPER_DIR,
  GRADLE_CACHE_DIR,
  GRADLE_WRAPPER_KEY,
  GRADLE_CACHE_KEY,
  ANDROID_GLOB,
  ANDROID_KEY,
  COMMANDLINE_TOOLS_VERSION,
  ANDROID_SDK_ROOT
} from './constants'

async function hashFiles(globs: string[]): Promise<string | undefined> {
  const globber = await glob.create(globs.join('\n'), {
    followSymbolicLinks: false
  })
  const hashes: Buffer[] = []

  for await (const file of globber.globGenerator()) {
    // skip directories
    if (fs.statSync(file).isDirectory()) continue

    core.debug(`hashFiles: found ${file}`)
    const hash = crypto.createHash('sha256')
    fs.createReadStream(file).pipe(hash)
    hashes.push(hash.digest())
  }

  // No files hashed
  if (hashes.length === 0) {
    core.debug('hashFiles: no hashes in array')
    return
  }

  // Loop trough files
  const completeHash = crypto.createHash('sha256')
  for (const hash of hashes) {
    completeHash.update(hash)
  }
  completeHash.end()
  return completeHash.digest('hex')
}

export async function preGradleWrapper(): Promise<void> {
  const wrapperHash = await hashFiles(GRADLE_WRAPPER_GLOB)
  const wrapperKey = `gradle-wrapper-${platform}-${wrapperHash}`
  const wrapperRestoreKeys = [`gradle-wrapper-${platform}-`, `gradle-wrapper-`]

  // if no wrapper is present skip trying to retrieve it
  if (!wrapperHash) {
    core.info('A hash for the gradle wrapper could not be generated')
    return
  }
  core.saveState(GRADLE_WRAPPER_KEY, wrapperKey)

  const wrapperCache = await cache.restoreCache(
    [GRADLE_WRAPPER_DIR],
    wrapperKey,
    wrapperRestoreKeys
  )

  if (!wrapperCache) {
    core.info(
      'Gradle wrapper cache not found, expect a download from gradle wrapper.'
    )
  }

  return
}

export async function postGradleWrapper(): Promise<void> {
  const wrapperKey = core.getState(GRADLE_WRAPPER_KEY)

  if (wrapperKey === '') {
    core.info(
      'A key for gradle wrapper was not defined, and thus there will not be a cache'
    )
    return
  }

  await cache.saveCache([GRADLE_WRAPPER_DIR], wrapperKey)

  return
}

export async function preGradleCache(): Promise<void> {
  const cacheHash = await hashFiles(GRADLE_CACHE_GLOB)
  const cacheKey = `gradle-cache-${platform}-${cacheHash}`
  const cacheRestoreKeys = [`gradle-cache-${platform}-`, `gradle-cache-`]

  if (!cacheHash) {
    core.info('A hash for the gradle dependencies could not be generated')
    return
  }
  core.saveState(GRADLE_CACHE_KEY, cacheKey)

  const cacheCache = await cache.restoreCache(
    [GRADLE_CACHE_DIR],
    cacheKey,
    cacheRestoreKeys
  )

  if (!cacheCache) {
    core.info('Gradle cache not found, expect dependency downloads from gradle')
  }

  return
}

export async function postGradleCache(): Promise<void> {
  const cacheKey = core.getState(GRADLE_CACHE_KEY)

  if (cacheKey === '') {
    core.info(
      'A key for gradle cache was not defined, and thus there will not be a cache'
    )
    return
  }

  await cache.saveCache([GRADLE_CACHE_DIR], cacheKey)

  return
}

export async function preAndroidCache(): Promise<void> {
  const androidHash = await hashFiles(ANDROID_GLOB)
  const androidKey = `android-${platform}-${COMMANDLINE_TOOLS_VERSION}-${androidHash}`
  const androidRestoreKeys = [
    `android-${platform}-${COMMANDLINE_TOOLS_VERSION}-`,
    `android-${platform}-`
  ]

  if (!androidHash) {
    core.info('A hash for the android sdk could not be generated')
    return
  }
  core.saveState(ANDROID_KEY, androidKey)

  const androidCache = await cache.restoreCache(
    [GRADLE_CACHE_DIR],
    androidKey,
    androidRestoreKeys
  )

  if (!androidCache) {
    core.info('Gradle cache not found, expect dependency downloads from gradle')
  }

  return
}

export async function postAndroidCache(): Promise<void> {
  const androidKey = core.getState(ANDROID_KEY)

  if (androidKey === '') {
    core.info(
      'A key for the android sdk was not defined, and thus there will not be a cache'
    )
    return
  }

  await cache.saveCache([ANDROID_SDK_ROOT], androidKey)

  return
}
