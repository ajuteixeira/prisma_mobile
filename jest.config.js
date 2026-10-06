/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  setupFiles: ["<rootDir>/jest.setup.ts"],
  // Desfaz `jest.spyOn` (ex.: o `fetch` de `mockFetch`) entre um teste e outro.
  restoreMocks: true,
  // Sem cache, o primeiro teste de cada tela transforma gluestack e NativeWind
  // dentro do próprio teste e passa dos 5s padrão.
  testTimeout: 30000,
  // O Expo Router trata tudo em `app/` como rota, então os testes ficam fora dele.
  testMatch: ["<rootDir>/__tests__/**/*.test.[jt]s?(x)"],
  // Padrão do `jest-expo` mais as libs que publicam ESM sem compilar (moti, nativewind, gluestack).
  transformIgnorePatterns: [
    "/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|standard-navigation|moti|@motify|nativewind|react-native-css|@gluestack-ui|@legendapp))",
    "/node_modules/react-native-reanimated/plugin/",
    "/node_modules/@react-native/babel-preset/",
  ],
  collectCoverageFrom: [
    "{app,components,config,constants,hooks,services,store}/**/*.{ts,tsx}",
    "!**/index.ts",
  ],
};
