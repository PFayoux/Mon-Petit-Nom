const { withAndroidStyles, AndroidConfig } = require('@expo/config-plugins');

// Android's default AppCompat theme falls back to a white/black windowBackground
// (depending on system light/dark mode) for the brief moment between the native
// splash screen and the first React Native frame. Pin it to the app's own
// background color so that gap never flashes white.
function withAndroidWindowBackground(config, backgroundColor) {
  return withAndroidStyles(config, (config) => {
    config.modResults = AndroidConfig.Styles.setStylesItem({
      xml: config.modResults,
      parent: AndroidConfig.Styles.getAppThemeGroup(),
      item: AndroidConfig.Resources.buildResourceItem({
        name: 'android:windowBackground',
        value: backgroundColor,
      }),
    });
    return config;
  });
}

module.exports = withAndroidWindowBackground;
