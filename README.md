# setup-android

![Build & Test](https://github.com/android-actions/setup-android/workflows/Build%20&%20Test/badge.svg)

This action sets up the Android SDK tools by:
 - Downloading the SDK commandline tools, if the current version (11.0) is not found in either `$ANDROID_SDK_ROOT` or `$HOME/.android/sdk`.
 - Accepting the SDK licenses.
 - Installing `tools` and `platform-tools`.
 - Adding `platform-tools` (contains adb) and `cmdline-tools/11.0/bin` (contains sdkmanager) to `$PATH`.
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
- uses: actions/checkout@v4

- name: Set up JDK 17
  uses: actions/setup-java@v3
  with:
    java-version: '17'
    distribution: 'temurin'

- name: Setup Android SDK
  uses: android-actions/setup-android@v3

- name: Build SampleApplication
  run: ./gradlew --no-daemon build
```

## SDK Version selection

Command line tools are versioned using two variables - short and long.
Long one is the build number, used in the zip URL, short one is the human friendly version name.

By default, setup-android installs version 10406996 (short version 11.0).

To install a different version, call setup-android with desired long version as the input parameter `cmdline-tools-version`:
```yaml
- name: Setup Android SDK
  uses: android-actions/setup-android@v3
  with:
    cmdline-tools-version: 8512546
```

#### Version table
| Short version | Long version |
| --- | --- |
| 11.0 | 10406996 |
| 10.0 | 9862592 |
| 9.0 | 9477386 |
| 8.0 | 9123335 |
| 7.0 | 8512546 |

Current cmdline tools version can be found at https://developer.android.com/studio#command-line-tools-only


# Android SDK Licences

Android SDK (unsurprisingly) is not public domain software, it comes with a licence.

Input parameter `accept-android-sdk-licenses` decides if Android SDK licences should be agreed to on behalf of the user of this action.
Default option is 'yes', because otherwise SDK is unusable until said licences are agreed to.

Licences are quite long, to prevent a wall of text in the action output, licences can be agreed to silently.
Input parameter `log-accepted-android-sdk-licenses` controls whether licence texts should be printed or omitted from the text output. Defaults to 'true'.

# Thanks
Based on the project [android-problem-matchers-action](https://github.com/jonasb/android-problem-matchers-action) from [@jonasb](https://github.com/jonasb)
