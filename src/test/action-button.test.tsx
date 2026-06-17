import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "sonner";
import { ActionButton } from "@/components/action-button";

function ui(node: React.ReactNode) {
  return render(<><Toaster />{node}</>);
}

describe("ActionButton", () => {
  it("opens dialog, validates required fields, and emits success toast", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    ui(
      <ActionButton
        label="Home collection"
        title="Schedule home collection"
        fields={[
          { name: "patient", label: "Patient" },
          { name: "slot", label: "Slot", defaultValue: "Tomorrow 7-9 AM" },
        ]}
        confirmLabel="Schedule"
        successMessage={(v) => `Scheduled for ${v.patient}`}
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole("button", { name: /home collection/i }));
    expect(await screen.findByText("Schedule home collection")).toBeInTheDocument();

    // Missing required field → validation toast, no onConfirm
    await user.click(screen.getByRole("button", { name: /^schedule$/i }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(await screen.findByText(/patient is required/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText("Patient"), "Aarav");
    await user.click(screen.getByRole("button", { name: /^schedule$/i }));

    expect(onConfirm).toHaveBeenCalledWith({ patient: "Aarav", slot: "Tomorrow 7-9 AM" });
    expect(await screen.findByText(/scheduled for aarav/i)).toBeInTheDocument();
  });

  it("confirms with no fields and emits default success toast", async () => {
    const user = userEvent.setup();
    ui(<ActionButton label="AI Receptionist" />);
    await user.click(screen.getByRole("button", { name: /ai receptionist/i }));
    await user.click(screen.getByRole("button", { name: /^confirm$/i }));
    expect(await screen.findByText(/ai receptionist completed/i)).toBeInTheDocument();
  });

  it("cancel closes the dialog without calling onConfirm", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    ui(<ActionButton label="Templates" onConfirm={onConfirm} />);
    await user.click(screen.getByRole("button", { name: /templates/i }));
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onConfirm).not.toHaveBeenCalled();
  });
});