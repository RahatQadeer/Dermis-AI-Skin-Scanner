/* eslint-disable @typescript-eslint/no-require-imports -- Metro config is CommonJS */
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// TFJS ships some Node-oriented entry points; keep RN resolution stable.
config.resolver.unstable_enablePackageExports = true;
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs', 'mjs'];

module.exports = config;
