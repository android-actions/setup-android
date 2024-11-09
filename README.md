# setup-android

![Build & Test](https://github.com/android-actions/setup-android/workflows/Build%20&%20Test/badge.svg)

This action sets up the Android SDK tools by:
 - Downloading the SDK commandline tools, if the current version (16.0) is not found in either `$ANDROID_SDK_ROOT` or `$HOME/.android/sdk`.
 - Accepting the SDK licenses.
 - Installing `tools` and `platform-tools`.
 - Adding `platform-tools` (contains adb) and `cmdline-tools/16.0/bin` (contains sdkmanager) to `$PATH`.
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

## Additional packages
Input parameter `packages` controls which packages this action will install from Android SDK.

Default value is `tools platform-tools`, supply an empty string to skip installing additional packages.

Additional packages can be installed at a later time by calling sdkmanager manually.

```yaml
- name: Setup Android SDK
  uses: android-actions/setup-android@v3
  with:
    packages: ''

# ...

- run: sdkmanager tools platform-tools
```

## SDK Version selection

Command line tools are versioned using two variables - short and long.
Long one is the build number, used in the zip URL, short one is the human friendly version name.

By default, setup-android installs version 12266719 (short version 16.0).

To install a different version, call setup-android with desired long version as the input parameter `cmdline-tools-version`:
```yaml
- name: Setup Android SDK
  uses: android-actions/setup-android@v3
  with:
    cmdline-tools-version: 8512546
```

#### Version table
| Short version | Long version |
|---------------| --- |
| 16.0          | 12266719 |
| 13.0          | 11479570 |
| 12.0          | 11076708 |
| 11.0          | 10406996 |
| 10.0          | 9862592 |
| 9.0           | 9477386 |
| 8.0           | 9123335 |
| 7.0           | 8512546 |

Current cmdline tools version can be found at https://developer.android.com/studio#command-line-tools-only


# Android SDK Licenses

Android SDK is not public domain software, it comes with a license.

Input parameter `accept-android-sdk-licenses` decides if Android SDK licenses should be agreed to on behalf of the user of this action.
Default option is 'yes', because otherwise SDK is unusable until said licenses are agreed to.

licenses are quite long, to prevent a wall of text in the action output, licenses can be agreed to silently.
Input parameter `log-accepted-android-sdk-licenses` controls whether license texts should be printed or omitted from the text output. Defaults to 'true'.

# Thanks
Based on the project [android-problem-matchers-action](https://github.com/jonasb/android-problem-matchers-action) from [@jonasb](https://github.com/jonasb)
