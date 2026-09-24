// `config/index.ts` valida o ambiente ao ser importado; nenhum teste fala com a API real.
process.env.EXPO_PUBLIC_API_URL = "http://api.test";

// Reanimated (usado pelo moti) e Worklets dependem de módulos nativos.
// O `src/mock` do worklets 0.10 não cobre a API que o mock do reanimated 4.5
// usa (holders, createShareable, ...): o Proxy devolve uma função vazia
// genérica para o que faltar.
jest.mock("react-native-worklets", () => {
  const actual = jest.requireActual("react-native-worklets/src/mock");
  return new Proxy(actual, {
    get: (target, prop) => (prop in target ? target[prop] : () => ({})),
  });
});
jest.mock("react-native-reanimated", () => jest.requireActual("react-native-reanimated/mock"));

// `standard-navigation` é ESM-only ("type": "module") e o Jest não consegue
// dar require() nele (ERR_REQUIRE_ESM). O expo-router só o usa nas APIs
// `unstable_*`, fora do caminho dos testes.
jest.mock("standard-navigation", () => ({
  createStandardNavigator: (NavigatorContent: unknown) => ({
    type: "standard",
    version: 1,
    NavigatorContent,
  }),
}));

// Sem animação real, o `AnimatePresence` do moti não re-renderiza ao fim da saída e
// o próximo passo nunca monta. Nos testes a troca de passo é imediata.
jest.mock("moti", () => ({
  ...jest.requireActual("moti"),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

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
