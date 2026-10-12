const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Keep Metro from walking/ watching directories that are not part of the
// mobile app bundle. Without this the Linux fallback watcher (used when
// watchman is not installed) exhausts the inotify watch limit on repos that
// also contain the backend and Foundry contracts.
const escaped = (p) => p.replace(/[/\\]/g, '[/\\\\]');
const existingBlocks = Array.isArray(config.resolver.blockList)
  ? config.resolver.blockList
  : config.resolver.blockList
    ? [config.resolver.blockList]
    : [];

config.resolver.blockList = [
  ...existingBlocks,
  new RegExp(`^${escaped(path.resolve(__dirname, 'pulse-socials-backend'))}[/\\\\].*`),
  new RegExp(`^${escaped(path.resolve(__dirname, 'contracts'))}[/\\\\].*`),
  new RegExp(`^${escaped(path.resolve(__dirname, 'dist'))}[/\\\\].*`),
];

module.exports = withNativeWind(config, { input: './global.css', inlineRem: 16 });
