import { MotiView } from "moti";
import { Callout } from "./_callout";

/** Mensagem de erro que entra animada; sem `message`, não renderiza nada. */
export const FormError = ({ message }: { message: string | null }) =>
  message ? (
    <MotiView
      from={{ opacity: 0, translateY: -6 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 180 }}
      className="mb-3"
    >
      <Callout tone="danger">{message}</Callout>
    </MotiView>
  ) : null;
