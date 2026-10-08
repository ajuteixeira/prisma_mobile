import { PlatformCard } from "@/components/auth";
import { PLATFORMS } from "@/constants";
import { fireEvent, render, screen } from "@/__tests__/utils";

const STEAM = PLATFORMS[0];

describe("PlatformCard", () => {
  it("convida a conectar e repassa a plataforma no toque", async () => {
    const onPress = jest.fn();
    await render(
      <PlatformCard platform={STEAM} status="off" onPress={onPress} />,
    );

    await fireEvent.press(screen.getByLabelText("Conectar Steam"));

    expect(screen.getByText("Conectar")).toBeOnTheScreen();
    expect(onPress).toHaveBeenCalledWith(STEAM);
  });

  it("vinculada, o botão vira desvincular", async () => {
    await render(
      <PlatformCard platform={STEAM} status="on" handle="gaben" onPress={jest.fn()} />,
    );

    expect(screen.getByText("Conectado · gaben")).toBeOnTheScreen();
    expect(screen.getByLabelText("Desvincular Steam")).toBeSelected();
    expect(screen.queryByText("Conectar")).not.toBeOnTheScreen();
  });

  it("ignora toques enquanto autentica", async () => {
    const onPress = jest.fn();
    await render(
      <PlatformCard platform={STEAM} status="loading" onPress={onPress} />,
    );

    await fireEvent.press(screen.getByLabelText("Conectar Steam"));

    expect(screen.getByText(STEAM.loading)).toBeOnTheScreen();
    expect(screen.getByLabelText("Conectar Steam")).toBeBusy();
    expect(onPress).not.toHaveBeenCalled();
  });
});
