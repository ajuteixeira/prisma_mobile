const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// `.ico` não faz parte da lista padrão do Metro; o ícone da marca
// (assets/prisma-icon.ico) precisa ser servido como asset binário.
if (!config.resolver.assetExts.includes("ico")) {
  config.resolver.assetExts.push("ico");
}

module.exports = withNativeWind(config, { input: "./styles/global.css" });
