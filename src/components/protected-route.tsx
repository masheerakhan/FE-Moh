import React, { useEffect, useState } from "react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { currentUser as defaultUser } from "@/lib/tenant-context";
import { useRBAC } from "@/components/rbac-guard";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const checkPathWithRBAC = (
  role: string,
  userPerms: string[],
  userModules: string[],
  path: string
): boolean => {
  const cleanRole = role?.toLowerCase() || "";

  // SUPER ADMIN MASTER BYPASS RULE: Super Admin gets unconditional access to all modules and paths
  if (cleanRole === "super admin" || cleanRole === "superadmin") {
    return true;
  }

  // 1. Patient Profile constraints
  if (cleanRole === "patient") {
    return path.startsWith("/patient") || path.startsWith("/patient-widget");
  }

  // 2. Receptionist / Clinical Staff constraints
  if (["receptionist", "clinical staff"].includes(cleanRole)) {
    // Explicitly block Receptionist from rendering the Patient Module workspace (/patient)
    if (path.startsWith("/patient") && !path.startsWith("/patient-onboarding")) {
      return false;
    }
    return (
      path.startsWith("/reception") ||
      path.startsWith("/appointments") ||
      path.startsWith("/billing") ||
      path.startsWith("/patient-onboarding")
    );
  }

  // 3. Clinic Admin constraints
  if (cleanRole === "clinic admin" || cleanRole === "clinicadmin") {
    // Block clinic admin from patient-facing apps or standard front-desk reception interfaces
    if (
      path.startsWith("/patient") ||
      path.startsWith("/patient-widget") ||
      path.startsWith("/reception") ||
      path.startsWith("/appointments") ||
      path.startsWith("/billing") ||
      path.startsWith("/patient-onboarding")
    ) {
      return false;
    }
  }

  // 4. Command Center (root /) constraints
  if (path === "/") {
    return ["super admin", "superadmin", "organization admin", "clinic admin", "clinicadmin"].includes(cleanRole);
  }

  // 5. Default module-based permission gates
  if (path.startsWith("/admin/super") || path.startsWith("/whitelabel") || path.startsWith("/subscriptions") || path.startsWith("/admin/features")) {
    return userModules.includes("admin") || userPerms.includes("can_define_rbac_boundaries");
  }

  if (path.startsWith("/clinics") || path.startsWith("/admin/org")) {
    return userModules.includes("admin") || userPerms.includes("can_define_rbac_boundaries");
  }

  if (path.startsWith("/admin/clinic") || path.startsWith("/rbac") || path.startsWith("/admin/rbac")) {
    return (
      ["organization admin", "clinic admin", "clinicadmin"].includes(cleanRole) ||
      userModules.includes("rbac") ||
      userPerms.includes("can_manage_clinic_rbac")
    );
  }

  if (path.startsWith("/reception") || path.startsWith("/patient-onboarding")) {
    return userModules.includes("reception") || userPerms.includes("can_manage_patients") || cleanRole === "receptionist";
  }

  if (path.startsWith("/appointments")) {
    return userModules.includes("scheduling") || userPerms.includes("can_schedule_appointments");
  }

  if (path.startsWith("/billing")) {
    return userModules.includes("billing") || userPerms.includes("can_issue_gst_invoices");
  }

  if (path.startsWith("/doctor") || path.startsWith("/emr") || path.startsWith("/telemedicine")) {
    if (["receptionist", "clinical staff"].includes(cleanRole)) return false;
    return userModules.includes("emr") || userModules.includes("medical_records") || userModules.includes("patient") || userPerms.includes("can_parse_vitals") || cleanRole === "doctor";
  }

  if (path.startsWith("/lab") || path.startsWith("/pharmacy")) {
    return userModules.includes("lab") || userModules.includes("pharmacy") || userPerms.includes("can_paste_unstructured_labs");
  }

  if (path.startsWith("/analytics")) {
    return userModules.includes("analytics") || userPerms.includes("can_view_billing_consolidation");
  }

  if (path.startsWith("/patient")) {
    return cleanRole === "patient" || (["super admin", "superadmin", "organization admin", "clinic admin", "doctor"].includes(cleanRole) && !["receptionist", "clinical staff"].includes(cleanRole));
  }

  if (path.startsWith("/ai/")) {
    if (["receptionist", "clinical staff"].includes(cleanRole)) return false;
    return userModules.includes("ai");
  }

  return true;
};

export const checkPathPermission = (role: string, permissions: string[], path: string): boolean => {
  return checkPathWithRBAC(role, permissions, [], path);
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const routerState = useRouterState();
  const navigate = useNavigate();
  const pathname = routerState.location.pathname;
  
  const { permissions, userContext } = useRBAC();

  const [user, setUser] = useState<any>(defaultUser);
  const [isClient, setIsClient] = useState(false);

  // Read active user session from localStorage safely on client mount
  useEffect(() => {
    const saved = localStorage.getItem("active_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {}
    }
    setIsClient(true);
  }, []);

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

  const activeRole = userContext?.role || user.role;
  const activePerms = user.permissions || [];
  const activeModules = permissions?.modules || [];
  const isAuthorized = checkPathWithRBAC(activeRole, activePerms, activeModules, pathname);

  useEffect(() => {
    // Don't run auth checks until localStorage has been read on the client
    if (!isClient) return;

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
      const lowerRole = user.role?.toLowerCase() || "";
      if (lowerRole === "patient") {
        navigate({ to: "/patient" });
      } else if (["receptionist", "clinical staff"].includes(lowerRole)) {
        navigate({ to: "/reception" });
      } else if (lowerRole === "clinic admin" || lowerRole === "clinicadmin") {
        navigate({ to: "/admin/clinic" });
      } else if (lowerRole === "doctor" || user.permissions?.includes("can_parse_vitals")) {
        navigate({ to: "/doctor" });
      } else if (lowerRole === "organization admin") {
        navigate({ to: "/admin/org" });
      } else {
        navigate({ to: "/" });
      }
    }
  }, [pathname, user, navigate, isAuthorized, isClient]);

  if (!isClient) {
    return null;
  }

  // Strip unauthorized components completely from the DOM tree
  // Only after client has hydrated from localStorage
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
