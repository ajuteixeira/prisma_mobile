import { memo } from "react";
import { Text, View } from "react-native";

type SectionLabelProps = {
  children: string;
  /** "CONTA"/"SESSÃO" usam o cinza; "ZONA DE PERIGO" usa o vermelho. */
  color?: string;
};

/** Rótulo de grupo da lista de Configurações (12px, entreletras 1px, caixa alta). */
export const SectionLabel = memo(({ children, color = "#9ca3af" }: SectionLabelProps) => (
  <Text
    className="mx-1 mb-2.5 mt-6 text-[12px] font-semibold uppercase"
    style={{ color, letterSpacing: 1 }}
  >
    {children}
  </Text>
));

SectionLabel.displayName = "SectionLabel";
