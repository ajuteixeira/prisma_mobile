export * from "@testing-library/react-native";
export * from "./_fetch";
// Sobrepõe o `render` do RNTL reexportado acima.
export { Providers, render } from "./_providers";
export * from "./_render-router";
