import { AnimatePresence, MotiView } from "moti";
import type { PropsWithChildren } from "react";

/** Troca animada entre os passos de um fluxo; `step` identifica o passo atual. */
export const StepTransition = ({ step, children }: PropsWithChildren<{ step: string }>) => (
  <AnimatePresence exitBeforeEnter>
    <MotiView
      key={step}
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: -12 }}
      transition={{ type: "timing", duration: 220 }}
    >
      {children}
    </MotiView>
  </AnimatePresence>
);
