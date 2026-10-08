import { useIsLoading, useLoadingMessage, withLoading } from "@/store";
import { renderHook } from "@testing-library/react-native";

/** Promise que só termina quando o teste chama `finish`. */
const pending = () => {
  let finish!: () => void;
  const promise = new Promise<void>((resolve) => (finish = resolve));
  return { promise, finish };
};

const state = async () => {
  const { result } = await renderHook(() => ({
    loading: useIsLoading(),
    message: useLoadingMessage(),
  }));
  return result.current;
};

describe("withLoading", () => {
  it("mostra a mensagem enquanto roda e limpa ao terminar", async () => {
    const step = pending();
    const run = withLoading(() => step.promise, "Vinculando conta");

    expect(await state()).toEqual({ loading: true, message: "Vinculando conta" });

    step.finish();
    await run;
    expect(await state()).toEqual({ loading: false, message: null });
  });

  it("usa a mensagem do loading mais recente e volta à anterior quando ele termina", async () => {
    const first = pending();
    const second = pending();
    const runFirst = withLoading(() => first.promise, "Salvando perfil");
    const runSecond = withLoading(() => second.promise, "Gerando código");

    expect((await state()).message).toBe("Gerando código");

    second.finish();
    await runSecond;
    expect(await state()).toEqual({ loading: true, message: "Salvando perfil" });

    first.finish();
    await runFirst;
  });

  it("mantém o loading sem texto quando não há mensagem", async () => {
    const step = pending();
    const run = withLoading(() => step.promise);

    expect(await state()).toEqual({ loading: true, message: null });

    step.finish();
    await run;
  });

  it("encerra o loading mesmo quando a promise falha", async () => {
    await expect(withLoading(() => Promise.reject(new Error("falhou")), "Salvando")).rejects.toThrow(
      "falhou",
    );

    expect(await state()).toEqual({ loading: false, message: null });
  });
});
