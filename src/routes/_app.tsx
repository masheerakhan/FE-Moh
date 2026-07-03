import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/protected-route";

export const Route = createFileRoute("/_app")({
  component: () => (
    <ProtectedRoute>
      <AppShell />
    </ProtectedRoute>
  ),
});