const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// `.ico` não faz parte da lista padrão do Metro; o ícone da marca
// (assets/prisma-icon.ico) precisa ser servido como asset binário.
if (!config.resolver.assetExts.includes("ico")) {
  config.resolver.assetExts.push("ico");
}

/**
 * No SSR do Expo Router (router-server, `resolver.environment=node`), o
 * `import "tslib"` do framer-motion resolve para o wrapper ESM
 * `tslib/modules/index.js`, cujo default-import do CJS quebra no interop do
 * Hermes ("Cannot destructure property '__extends'"). No ambiente node
 * forçamos o build CJS (`tslib.js` — o alvo da condição `default` do próprio
 * pacote); cliente nativo e web continuam resolvendo normalmente.
 */
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "tslib" && context.customResolverOptions?.environment === "node") {
    return {
      type: "sourceFile",
      filePath: path.join(config.projectRoot, "node_modules", "tslib", "tslib.js"),
    };
  }
  return defaultResolveRequest
    ? defaultResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./styles/global.css" });
