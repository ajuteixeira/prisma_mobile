// `config/index.ts` valida o ambiente ao ser importado; nenhum teste fala com a API real.
process.env.EXPO_PUBLIC_API_URL = "http://api.test";

// Reanimated (usado pelo moti) e Worklets dependem de módulos nativos.
jest.mock("react-native-worklets", () => jest.requireActual("react-native-worklets/src/mock"));
jest.mock("react-native-reanimated", () => jest.requireActual("react-native-reanimated/mock"));

// Insets zerados e frame fixo, sem precisar de `SafeAreaProvider` em cada teste.
jest.mock("react-native-safe-area-context", () =>
  jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

// O moti importa o `SafeAreaView` do react-native, que avisa da depreciação a cada suíte.
const warn = console.warn;
console.warn = (...args: unknown[]) => {
  if (typeof args[0] === "string" && args[0].startsWith("SafeAreaView has been deprecated")) return;
  warn(...args);
};
