# setup-android

![Build & Test](https://github.com/android-actions/setup-android/workflows/Build%20&%20Test/badge.svg)

This action sets up the Android SDK tools by:
 - Downloading the SDK commandline tools
 - Accepting the SDK licenses
 

# Usage

See [action.yml](action.yml)

## Basic
```yaml
steps:
- uses: actions/checkout@v3

- name: Set up JDK 1.8
  uses: actions/setup-java@v1
  with:
    java-version: 1.8

- name: Setup Android SDK
  uses: android-actions/setup-android@v2

- name: Build SampleApplication
  run: ./gradlew --no-daemon build
```


# Thanks
Based on the project [android-problem-matchers-action](https://github.com/jonasb/android-problem-matchers-action) from [@jonasb](https://github.com/jonasb)
