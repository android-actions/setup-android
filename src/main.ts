import * as core from '@actions/core'
import * as path from 'path'
import {ANDROID_SDK_ROOT, ANNOTATION_MATCHERS} from './constants'
import {preGradleCache, preAndroidCache, preGradleWrapper} from './cache'
import {install} from './install'

async function run(): Promise<void> {
  // process all caching but wait for them to all complete
  await Promise.all([preGradleWrapper(), preGradleCache(), preAndroidCache()])

  await install()

  core.exportVariable('ANDROID_HOME', ANDROID_SDK_ROOT)
  core.exportVariable('ANDROID_SDK_ROOT', ANDROID_SDK_ROOT)

  core.addPath(path.join(ANDROID_SDK_ROOT, 'tools', 'bin'))
  core.addPath(path.join(ANDROID_SDK_ROOT, 'platform-tools'))

  core.debug('add matchers')
  const matchersPath = path.join(__dirname, '..', '..', '.github')
  for (const matcher of ANNOTATION_MATCHERS) {
    // eslint-disable-next-line no-console
    console.log(`##[add-matcher]${path.join(matchersPath, matcher)}`)
  }
}

run()
