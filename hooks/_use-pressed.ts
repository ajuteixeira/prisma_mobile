import { useCallback, useMemo, useState } from "react";
import type { PressableProps } from "react-native";

/**
 * Estado de toque de um `Pressable`, com os handlers para espalhar nele. O
 * `cssInterop` do NativeWind mescla `style` com as classes e descarta a forma de
 * função (`style={({ pressed }) => …}`), então o toque precisa vir deste estado.
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
