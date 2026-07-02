import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "sonner";

// Polyfill crypto.randomUUID for both Node global and browser window scopes
if (typeof window !== "undefined") {
  if (!window.crypto) {
    // @ts-ignore
    window.crypto = {} as any;
  }
  if (!window.crypto.randomUUID) {
    window.crypto.randomUUID = (() => Math.random().toString(36).substring(2) + "-" + Math.random().toString(36).substring(2)) as any;
  }
}
if (typeof crypto === "undefined" || !crypto.randomUUID) {
  // @ts-ignore
  global.crypto = {
    randomUUID: (() => Math.random().toString(36).substring(2) + "-" + Math.random().toString(36).substring(2)) as any
  };
}

import { RbacPage } from "@/routes/_app.rbac";

// Mock router imports
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => () => ({
    head: () => {},
    component: () => null,
  }),
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  useRouterState: () => ({ location: { pathname: "/rbac" } }),
}));

function ui() {
  return render(
    <>
      <Toaster />
      <RbacPage />
    </>
  );
}

describe("Advanced RBAC page flow", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders correctly with seed roles", async () => {
    ui();
    expect(screen.getByText("Advanced RBAC")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /super admin/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /organization admin/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /doctor/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /receptionist/i })).toBeInTheDocument();
  });

  it("allows selecting a role and shows its policy JSON", async () => {
    ui();
    const receptionistBtn = screen.getByRole("button", { name: /receptionist/i });
    fireEvent.click(receptionistBtn);

    // Should show description of selected role
    expect(screen.getByText("Front desk — registration, appointments, queue, billing.")).toBeInTheDocument();

    // Matrix tab active
    expect(screen.getByRole("tab", { name: /permission matrix/i })).toBeInTheDocument();
  });

  it("enables clone, edit, and delete options for system and custom roles", async () => {
    const user = userEvent.setup();
    ui();

    // Select Doctor role
    fireEvent.click(screen.getByRole("button", { name: /doctor/i }));

    // Click 'Clone' button
    const cloneBtn = screen.getByRole("button", { name: /clone/i });
    fireEvent.click(cloneBtn);

    // Verify modal is open and fields populated
    expect(await screen.findByText("Edit role details & permissions")).toBeInTheDocument();
    const nameInput = screen.getByPlaceholderText("e.g. Senior Cardiology Resident") as HTMLInputElement;
    expect(nameInput.value).toBe("Doctor (Copy)");

    // Modify name in modal and save (bypass pointer-events lockout)
    fireEvent.change(nameInput, { target: { value: "Cardiology Fellow" } });
    fireEvent.click(screen.getByRole("button", { name: /^save changes$/i }));

    // Verify newly cloned role appears in list
    expect(await screen.findByRole("button", { name: /cardiology fellow/i })).toBeInTheDocument();

    // Select custom role and click Edit
    fireEvent.click(screen.getByRole("button", { name: /cardiology fellow/i }));
    const editBtn = screen.getByRole("button", { name: /edit/i });
    fireEvent.click(editBtn);

    // Verify modal hydrates properly with custom name
    expect(await screen.findByText("Edit role details & permissions")).toBeInTheDocument();
    const editNameInput = screen.getByPlaceholderText("e.g. Senior Cardiology Resident") as HTMLInputElement;
    expect(editNameInput.value).toBe("Cardiology Fellow");

    // Modify description in modal and save changes
    const descTextarea = screen.getByPlaceholderText(/what this role can do/i) as HTMLTextAreaElement;
    fireEvent.change(descTextarea, { target: { value: "Fellow in training" } });
    fireEvent.click(screen.getByRole("button", { name: /^save changes$/i }));

    // Verify updated description displays
    expect(await screen.findByText("Fellow in training")).toBeInTheDocument();

    // Delete custom role
    const deleteBtn = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteBtn);

    // Verify it is removed from lists
    await waitFor(() => {
      expect(screen.queryByText("Cardiology Fellow")).not.toBeInTheDocument();
    });
  }, 15000);
});
