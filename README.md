# setup-android

![Build & Test](https://github.com/android-actions/setup-android/workflows/Build%20&%20Test/badge.svg)

This action sets up the Android SDK tools by:
 - Downloading the SDK commandline tools, if the current version (9.0) is not found in either `$ANDROID_SDK_ROOT` or `$HOME/.android/sdk`.
 - Accepting the SDK licenses.
 - Installing `tools` and `platform-tools`.
 - Adding `platform-tools` (contains adb) and `cmdline-tools/9.0/bin` (contains sdkmanager) to `$PATH`.
 - Setting up problem [matchers](/matchers.json).

On Windows 2016 runners, this action also checks if `$ANDROID_SDK_ROOT` path contains spaces.
If it does - it moves SDK to a path without spaces. This is needed because spaces are highly problematic:
```
C:\windows\system32\cmd.exe /D /S /C ""C:\Program Files (x86)\Android\android-sdk\cmdline-tools\3.0\bin\sdkmanager.bat" --licenses"
Error: Could not find or load main class Files
```

# Usage

See [action.yml](action.yml)

## Basic
```yaml
steps:
- uses: actions/checkout@v3

- name: Set up JDK 1.8
  uses: actions/setup-java@v3
  with:
    java-version: 1.8

- name: Setup Android SDK
  uses: android-actions/setup-android@v2

- name: Build SampleApplication
  run: ./gradlew --no-daemon build
```


# Thanks
Based on the project [android-problem-matchers-action](https://github.com/jonasb/android-problem-matchers-action) from [@jonasb](https://github.com/jonasb)
