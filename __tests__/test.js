#!/usr/bin/env node
const absoluteFilename = __filename;
const relativeFilename = __filename.replace(`${__dirname}/`, '');

// android-lint-file
console.log(`${absoluteFilename}: Warning: checkClientTrusted is empty, which could cause insecure network traffic due to trusting arbitrary TLS/SSL certificates presented by peers [TrustAllX509TrustManager]`);

// android-lint-line
console.log(`${absoluteFilename}:9: Warning: A newer version of androidx.core:core-ktx than 1.2.0-beta01 is available: 1.2.0-rc01 [GradleDependency]`);

// gradle
console.log(`warning   unused-exclude-by-conf             the exclude dependency is not in your dependency graph, so has no effect
${relativeFilename}:12`);

// kotlin-error
console.log(`e: ${absoluteFilename}: (16, 13): Val cannot be reassigned`);

// kotlin-warning
console.log(`w: ${absoluteFilename}: (19, 13): Parameter 'foo' is never used`);