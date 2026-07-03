import React, { useEffect, useState } from "react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { currentUser as defaultUser } from "@/lib/tenant-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const checkPathPermission = (role: string, permissions: string[], path: string): boolean => {
  const cleanRole = role?.toLowerCase() || "";
  if (cleanRole === "super admin" || cleanRole === "superadmin") return true;

  const userPerms = permissions || [];

  if (
    path.startsWith("/admin/super") ||
    path.startsWith("/whitelabel") ||
    path.startsWith("/subscriptions") ||
    path.startsWith("/admin/features") ||
    path.startsWith("/admin/org") ||
    path.startsWith("/clinics")
  ) {
    return userPerms.includes("can_define_rbac_boundaries");
  }

  if (path.startsWith("/admin/clinic") || path.startsWith("/rbac")) {
    return userPerms.includes("can_manage_clinic_rbac");
  }

  if (path.startsWith("/reception")) {
    return userPerms.includes("can_manage_patients");
  }

  if (path.startsWith("/appointments")) {
    return userPerms.includes("can_schedule_appointments");
  }

  if (path.startsWith("/billing")) {
    return userPerms.includes("can_issue_gst_invoices");
  }

  if (path.startsWith("/doctor") || path.startsWith("/emr") || path.startsWith("/telemedicine")) {
    return userPerms.includes("can_parse_vitals") || cleanRole === "doctor";
  }

  if (path.startsWith("/lab") || path.startsWith("/pharmacy")) {
    return userPerms.includes("can_paste_unstructured_labs");
  }

  if (path.startsWith("/analytics")) {
    return userPerms.includes("can_view_billing_consolidation");
  }

  if (path.startsWith("/ai/")) {
    return (
      userPerms.includes("can_parse_vitals") ||
      ["doctor", "clinic admin", "organization admin"].includes(cleanRole)
    );
  }

  return true;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const routerState = useRouterState();
  const navigate = useNavigate();
  const pathname = routerState.location.pathname;

  // Read active user session from localStorage
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("active_user");
    return saved ? JSON.parse(saved) : defaultUser;
  });

  // Keep state synced with localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("active_user");
      if (saved) {
        setUser(JSON.parse(saved));
      }
    };
    window.addEventListener("storage_user_change", handleStorageChange);
    return () => window.removeEventListener("storage_user_change", handleStorageChange);
  }, []);

  const isAuthorized = checkPathPermission(user.role, user.permissions, pathname);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate({ to: "/login" });
      return;
    }

    if (!isAuthorized) {
      toast.error("Access Restricted (DOM Stripped)", {
        description: `Your active profile permissions do not authorize access to ${pathname}.`
      });

      // Redirect fallback based on user role context
      if (user.role === "Patient") {
        navigate({ to: "/patient" });
      } else if (user.permissions?.includes("can_manage_patients")) {
        navigate({ to: "/reception" });
      } else if (user.role?.toLowerCase() === "doctor" || user.permissions?.includes("can_parse_vitals")) {
        navigate({ to: "/doctor" });
      } else if (user.role?.toLowerCase() === "organization admin") {
        navigate({ to: "/admin/org" });
      } else {
        navigate({ to: "/" });
      }
    }
  }, [pathname, user, navigate, isAuthorized]);

  // Strip unauthorized components completely from the DOM tree
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
