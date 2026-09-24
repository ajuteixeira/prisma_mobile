import { EmailStep } from "@/components/auth";
import { fireEvent, render, screen } from "@/utils/tests";

describe("EmailStep", () => {
  it("repassa o que é digitado e o envio pelo teclado", async () => {
    const onChangeEmail = jest.fn();
    const onSubmit = jest.fn();
    await render(<EmailStep email="" onChangeEmail={onChangeEmail} onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText("E-mail da conta");
    await fireEvent.changeText(input, "ana@prisma.gg");
    await fireEvent(input, "submitEditing");

    expect(onChangeEmail).toHaveBeenCalledWith("ana@prisma.gg");
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
