import { useCallback, useMemo, useState } from "react";
import type { PressableProps } from "react-native";

/**
 * Estado de toque de um `Pressable`.
 *
 * O NativeWind registra `cssInterop(Pressable, { className: "style" })`, então
 * ele trata `style` como um valor a mesclar com as classes e nunca chama a
 * forma de função — `style={({ pressed }) => …}` é silenciosamente descartado.
 * Rastreamos o toque aqui e devolvemos um `style` objeto, que o interop aplica.
 */
export const usePressed = () => {
  const [pressed, setPressed] = useState(false);

  const onPressIn = useCallback(() => setPressed(true), []);
  const onPressOut = useCallback(() => setPressed(false), []);

  return useMemo(
    () => ({ pressed, handlers: { onPressIn, onPressOut } satisfies PressableProps }),
    [onPressIn, onPressOut, pressed],
  );
};
