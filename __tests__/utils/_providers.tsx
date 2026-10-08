import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { render as rntlRender } from "@testing-library/react-native";
import type { PropsWithChildren, ReactElement } from "react";

/** Mesmos providers do `app/_layout.tsx`: os overlays do gluestack renderizam aqui. */
export const Providers = ({ children }: PropsWithChildren) => (
  <GluestackUIProvider>{children}</GluestackUIProvider>
);

/** `render` do RNTL já dentro dos providers do app. */
export const render = (ui: ReactElement, options?: Parameters<typeof rntlRender>[1]) =>
  rntlRender(ui, { wrapper: Providers, ...options });
