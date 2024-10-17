const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Ensure the 'sourceExts' array exists, then push 'cjs'
if (defaultConfig.resolver && defaultConfig.resolver.sourceExts) {
  defaultConfig.resolver.sourceExts.push('cjs');
} else {
  defaultConfig.resolver = {
    sourceExts: ['js', 'json', 'ts', 'tsx', 'jsx', 'cjs'], // Add common extensions if not defined
  };
}

module.exports = defaultConfig;