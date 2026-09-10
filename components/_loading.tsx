import { useLoading } from "@/store";
import { Image as MotiImage } from "moti";
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

const Loading = memo(() => {
  const loading = useLoading((s) => s.loading);
  if (loading === 0) return null;
  return (
    <View
      className="flex h-full w-full items-center justify-center"
      style={{ position: "absolute", zIndex: 9999 }}
    >
      <View
        className="p-3 flex justify-center items-center  h-full w-full gap-3"
        style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
      >
        <AnimatedLogo />
        <LoadingDots className="text-white" />
      </View>
    </View>
  );
});

export const LoadingProvider = (props: PropsWithChildren) => {
  return (
    <View className="w-full h-full">
      <Loading />
      {props.children}
    </View>
  );
};
