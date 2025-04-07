module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          alias: {
            // This is needed for NativeBase
            'react-dom': './node_modules/react-dom',
          },
        },
      ],
    ],
  };
};
