# Android Problem Matchers

Adds common problem matchers for Android builds to GitHub Action workflows.

## Inputs

No inputs are needed.

## Outputs

No outputs are generated apart from configured problem matchers.

## Example usage

In your workflow YAML file add this step:

```yaml
    - name: Setup Android problem matchers
      uses: jonasb/android-problem-matchers-action@v1
```

Example full workflow definition:

```yaml
name: Android CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - name: Setup JDK 1.8
      uses: actions/setup-java@v1
      with:
        java-version: 1.8
    - name: Setup Android problem matchers
      uses: jonasb/android-problem-matchers-action@v1
    - name: Build Android
      run: |
        ./gradlew build -PisCI=true
```

In order for Android Lint problems (especially warnings) to show up in the logs and be detected, make these changes to `app/build.gradle`:

```groovy
android {
  lintOptions {
    textReport project.hasProperty('isCI')
    textOutput 'stdout'
  }
}
```
