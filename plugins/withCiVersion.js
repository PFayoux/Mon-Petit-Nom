const { withAppBuildGradle } = require('@expo/config-plugins');

const VERSION_CODE_RE = /versionCode (\d+)/;
const VERSION_NAME_RE = /versionName "([^"]*)"/;

// Lets CI stamp a per-run versionCode/versionName without committing a bump to
// app.json. Falls back to the app.json-derived defaults when the env vars are unset.
function withCiVersion(config) {
  return withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    if (contents.includes('ANDROID_VERSION_CODE')) {
      return config;
    }

    if (!VERSION_CODE_RE.test(contents) || !VERSION_NAME_RE.test(contents)) {
      throw new Error('withCiVersion: could not find versionCode/versionName in build.gradle');
    }

    contents = contents.replace(
      VERSION_CODE_RE,
      (match, defaultCode) =>
        `versionCode (System.getenv("ANDROID_VERSION_CODE") ? System.getenv("ANDROID_VERSION_CODE").toInteger() : ${defaultCode})`
    );
    contents = contents.replace(
      VERSION_NAME_RE,
      (match, defaultName) => `versionName System.getenv("ANDROID_VERSION_NAME") ?: "${defaultName}"`
    );

    config.modResults.contents = contents;
    return config;
  });
}

module.exports = withCiVersion;
