import {postAndroidCache, postGradleCache, postGradleWrapper} from './cache'

async function run(): Promise<void> {
  await Promise.all([
    postGradleCache(),
    postGradleWrapper(),
    postAndroidCache()
  ])

  return
}

run()
