import { renderRouter as expoRenderRouter } from "expo-router/testing-library";

type RenderRouterResult = Awaited<ReturnType<typeof expoRenderRouter>> &
  Pick<
    ReturnType<typeof expoRenderRouter>,
    "getPathname" | "getPathnameWithParams" | "getSegments" | "getSearchParams" | "getRouterState"
  >;

/**
 * `renderRouter` do Expo Router compatível com o `render` assíncrono do RNTL 14.
 *
 * O original anexa `getPathname` e afins à Promise devolvida pelo `render`, e
 * eles se perdem no `await`. Aqui o resultado já vem com os getters, então os
 * matchers funcionam direto nele: `expect(view).toHavePathname("/home")`.
 */
export const renderRouter = async (
  ...args: Parameters<typeof expoRenderRouter>
): Promise<RenderRouterResult> => {
  const pending = expoRenderRouter(...args);
  const result = await pending;

  return Object.assign(result, {
    getPathname: pending.getPathname,
    getPathnameWithParams: pending.getPathnameWithParams,
    getSegments: pending.getSegments,
    getSearchParams: pending.getSearchParams,
    getRouterState: pending.getRouterState,
  });
};

// O Expo Router registra estes matchers ao ser importado, mas não publica os tipos.
declare global {
  namespace jest {
    interface Matchers<R> {
      toHavePathname(pathname: string): R;
      toHavePathnameWithParams(pathnameWithParams: string): R;
      toHaveSegments(segments: string[]): R;
      toHaveSearchParams(params: Record<string, string | string[]>): R;
      toHaveRouterState(state: ReturnType<RenderRouterResult["getRouterState"]>): R;
    }
  }
}
