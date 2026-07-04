const { withAppBuildGradle } = require('@expo/config-plugins');

const RELEASE_SIGNING_CONFIG = `
        release {
            if (System.getenv("ANDROID_RELEASE_STORE_FILE")) {
                storeFile file(System.getenv("ANDROID_RELEASE_STORE_FILE"))
                storePassword System.getenv("ANDROID_RELEASE_STORE_PASSWORD")
                keyAlias System.getenv("ANDROID_RELEASE_KEY_ALIAS")
                keyPassword System.getenv("ANDROID_RELEASE_KEY_PASSWORD")
            }
        }`;

const DEBUG_SIGNING_IN_RELEASE =
  '// see https://reactnative.dev/docs/signed-apk-android.\n            signingConfig signingConfigs.debug';
const CONDITIONAL_SIGNING_IN_RELEASE =
  '// see https://reactnative.dev/docs/signed-apk-android.\n            signingConfig System.getenv("ANDROID_RELEASE_STORE_FILE") ? signingConfigs.release : signingConfigs.debug';

// Falls back to debug signing when ANDROID_RELEASE_STORE_FILE isn't set, so local
// `expo prebuild` / `expo run:android` keeps working without a release keystore.
function withReleaseSigning(config) {
  return withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    if (contents.includes('ANDROID_RELEASE_STORE_FILE')) {
      return config;
    }

    if (!contents.includes('signingConfigs {')) {
      throw new Error('withReleaseSigning: could not find signingConfigs block in build.gradle');
    }
    contents = contents.replace('signingConfigs {', `signingConfigs {${RELEASE_SIGNING_CONFIG}`);

    if (!contents.includes(DEBUG_SIGNING_IN_RELEASE)) {
      throw new Error(
        'withReleaseSigning: could not find release buildType signingConfig line in build.gradle'
      );
    }
    contents = contents.replace(DEBUG_SIGNING_IN_RELEASE, CONDITIONAL_SIGNING_IN_RELEASE);

    config.modResults.contents = contents;
    return config;
  });
}

module.exports = withReleaseSigning;
