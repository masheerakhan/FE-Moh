import React, { createContext, useContext, useState, useEffect } from "react";
import { axiosInstance } from "@/lib/api";
import { useRouterState } from "@tanstack/react-router";

interface UserContext {
  organization_id: string;
  clinic_id: string | null;
  role: string;
  name: string;
  specialization: string;
}

interface PermissionsData {
  modules: string[];
  screens: string[];
  fields_hidden: string[];
  actions: Record<string, string[]>;
}

interface RBACContextType {
  userContext: UserContext | null;
  permissions: PermissionsData | null;
  loading: boolean;
  refreshPermissions: () => Promise<void>;
  hasAccess: (params: { module?: string; screen?: string; field?: string; action?: string }) => boolean;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export const useRBAC = () => {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error("useRBAC must be used within an RBACProvider");
  }
  return context;
};

export const RBACProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [permissions, setPermissions] = useState<PermissionsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const routerState = useRouterState();
  const currentPath = routerState?.location?.pathname;

  useEffect(() => {
    refreshPermissions();
  }, [currentPath]);

  const refreshPermissions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      
      const response = await axiosInstance.get("/auth/me/permissions");
      const { user_context, permissions: perms } = response.data;
      setUserContext(user_context);
      setPermissions(perms);
    } catch (error) {
      console.warn("Backend permissions lookup failed, falling back to local storage session payload", error);
      
      // Fallback: Read session context from local storage
      const activeUserStr = localStorage.getItem("active_user");
      if (activeUserStr) {
        try {
          const user = JSON.parse(activeUserStr);
          setUserContext({
            organization_id: user.organization_id || "org_apollo",
            clinic_id: user.clinic_id || null,
            role: user.role || "Doctor",
            name: user.name || "Default User",
            specialization: user.specialization || "Clinical Staff"
          });
          
          // Build permission maps matching user's permissions array
          const rawPerms = user.permissions || [];
          const modules = new Set<string>();
          const screens = new Set<string>();
          const actions: Record<string, string[]> = {};
          
          // Seed standard configurations based on permissions strings
          if (user.role?.toLowerCase() === "super admin") {
            setPermissions({
              modules: ["billing", "emr", "reception", "scheduling", "rbac", "pharmacy", "lab", "subscriptions", "whitelabel", "analytics", "admin"],
              screens: ["billing-dashboard", "patient-history", "reception-desk", "appointment-scheduler", "access-control", "pharmacy-inventory", "lab-reports", "super-admin"],
              fields_hidden: [],
              actions: {
                billing: ["create", "view", "edit", "delete", "export", "approve", "reject"],
                emr: ["create", "view", "edit", "delete"],
                reception: ["create", "view", "edit", "delete"],
                scheduling: ["create", "view", "edit", "delete"]
              }
            });
          } else {
            rawPerms.forEach((p: string) => {
              if (p === "can_issue_gst_invoices") {
                modules.add("billing");
                screens.add("billing-dashboard");
                actions["billing"] = [...(actions["billing"] || []), "create", "view", "edit", "delete"];
              } else if (p === "can_manage_patients") {
                modules.add("reception");
                screens.add("reception-desk");
                actions["reception"] = [...(actions["reception"] || []), "create", "view", "edit", "delete"];
              } else if (p === "can_schedule_appointments") {
                modules.add("scheduling");
                screens.add("appointment-scheduler");
                actions["scheduling"] = [...(actions["scheduling"] || []), "create", "view", "edit", "delete"];
              }
            });
            
            // Standard doctor permissions
            if (user.role?.toLowerCase() === "doctor") {
              modules.add("emr");
              screens.add("patient-history");
              actions["emr"] = ["create", "view", "edit"];
            }

            setPermissions({
              modules: Array.from(modules),
              screens: Array.from(screens),
              fields_hidden: [],
              actions
            });
          }
        } catch (e) {
          console.error("Failed to parse local storage session user context", e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshPermissions();
    
    // Listen for storage login/logout change events
    const handleStorageChange = () => {
      refreshPermissions();
    };
    window.addEventListener("storage_user_change", handleStorageChange);

    // Dynamic background polling every 60 seconds
    const pollInterval = setInterval(() => {
      refreshPermissions();
    }, 60000);

    return () => {
      window.removeEventListener("storage_user_change", handleStorageChange);
      clearInterval(pollInterval);
    };
  }, []);

  const hasAccess = ({ module, screen, field, action }: { module?: string; screen?: string; field?: string; action?: string }): boolean => {
    // 1. Implicit Denied if not loaded
    if (!userContext || !permissions) {
      return false;
    }

    const cleanRole = userContext.role.toLowerCase();

    // 2. Screen Validation Check
    if (screen && !permissions.screens.map(s => s.toLowerCase()).includes(screen.toLowerCase())) {
      return false;
    }

    // 3. Module Validation Check
    if (module && !permissions.modules.map(m => m.toLowerCase()).includes(module.toLowerCase())) {
      return false;
    }

    // 4. Hidden Fields Restriction
    if (field && permissions.fields_hidden.map(f => f.toLowerCase()).includes(field.toLowerCase())) {
      return false;
    }

    // 5. Action CRUD Checks
    if (action && module) {
      const allowedActions = permissions.actions[module.toLowerCase()] || [];
      if (!allowedActions.map(a => a.toLowerCase()).includes(action.toLowerCase())) {
        return false;
      }
    }

    return true;
  };

  return (
    <RBACContext.Provider value={{ userContext, permissions, loading, refreshPermissions, hasAccess }}>
      {children}
    </RBACContext.Provider>
  );
};

interface RBACGuardProps {
  module?: string;
  screen?: string;
  field?: string;
  action?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const RBACGuard: React.FC<RBACGuardProps> = ({
  module,
  screen,
  field,
  action,
  fallback = null,
  children
}) => {
  const { hasAccess, loading } = useRBAC();

  if (loading) {
    return null;
  }

  const allowed = hasAccess({ module, screen, field, action });

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
