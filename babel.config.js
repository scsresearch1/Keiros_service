module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // expo-router is handled automatically by babel-preset-expo in SDK 50+
  };
};
