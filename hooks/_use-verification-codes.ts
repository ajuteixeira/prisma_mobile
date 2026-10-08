import type { PlatformSlug } from "@/constants";
import { platformsApi, type VerificationCode } from "@/services";
import { useSession } from "@/store";
import { describeApiError } from "@/utils";
import { useState } from "react";
import { useRequest } from "./_use-request";

type IssuedCode = VerificationCode & { expiresAt: number };

/** Margem para não enviar um código que expira no meio da requisição. */
const EXPIRY_MARGIN = 60_000;

const describeCodeError = (error: unknown) =>
  describeApiError(error, "Não foi possível gerar o código de verificação.");

/** Códigos `PRISMA-XXXX` de posse por plataforma, reaproveitados enquanto valem. */
export const useVerificationCodes = () => {
  const token = useSession((state) => state.token);
  const [codes, setCodes] = useState<Partial<Record<PlatformSlug, IssuedCode>>>({});
  const request = useRequest(describeCodeError);

  /** Sem `force`, só busca quando não há um código válido para a plataforma. */
  const issue = async (slug: PlatformSlug, force = false) => {
    const current = codes[slug];
    if (!token || (!force && current && current.expiresAt - EXPIRY_MARGIN > Date.now())) return;

    const issued = await request.run(() => platformsApi.verificationCode(slug, token));
    if (issued)
      setCodes((all) => ({
        ...all,
        [slug]: { ...issued, expiresAt: Date.now() + issued.expires_in * 1000 },
      }));
  };

  /** Descarta o código da plataforma: cada vínculo exige um novo. */
  const discard = (slug: PlatformSlug) => setCodes(({ [slug]: _used, ...rest }) => rest);

  return {
    get: (slug: PlatformSlug) => codes[slug] ?? null,
    issue,
    discard,
    loading: request.loading,
    error: request.error,
  };
};
