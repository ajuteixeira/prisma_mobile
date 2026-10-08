import { useIsLoading, useLoadingMessage } from "@/store";
import { AnimatePresence, Image as MotiImage, MotiView } from "moti";
import { memo, useEffect, useState, type PropsWithChildren } from "react";
import { Text, View } from "react-native";

const AnimatedLogo = memo(() => (
  <MotiImage
    from={{ opacity: 0.5 }}
    animate={{ opacity: 1 }}
    transition={{ loop: true, type: "timing", duration: 800 }}
    style={{ width: 104, height: 104 }}
    resizeMode="contain"
    source={require("@/assets/prisma-icon.ico")}
  />
));

type LoadingDotsProps = {
  className?: string;
  text?: string;
};

export const LoadingDots = memo(({ className, text }: LoadingDotsProps) => {
  const [dots, setDots] = useState("");
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 500);
    return () => clearInterval(interval);
  }, []);
  return (
    <Text className={className}>
      {text ? text : "Carregando"}
      {dots}
    </Text>
  );
});

const LoadingOverlay = ({ message }: { message: string | null }) => (
  <MotiView
    accessible
    accessibilityRole="progressbar"
    accessibilityLabel={message ?? "Carregando"}
    from={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ type: "timing", duration: 160 }}
    className="absolute inset-0 items-center justify-center gap-3"
    style={{ zIndex: 9999, backgroundColor: "rgba(0, 0, 0, 0.45)" }}
  >
    <AnimatedLogo />
    <LoadingDots className="text-white" text={message ?? undefined} />
  </MotiView>
);

export const LoadingProvider = ({ children }: PropsWithChildren) => {
  const isLoading = useIsLoading();
  const message = useLoadingMessage();

  return (
    <View className="flex-1">
      {children}
      <AnimatePresence>{isLoading ? <LoadingOverlay message={message} /> : null}</AnimatePresence>
    </View>
  );
};
