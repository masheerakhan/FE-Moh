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
        setUserContext(null);
        setPermissions(null);
        setLoading(false);
        return;
      }
      
      const response = await axiosInstance.get("/auth/me/permissions", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const { user_context, permissions: perms } = response.data;
      setUserContext(user_context);
      setPermissions(perms);
    } catch (error) {
      console.warn("Backend permissions lookup failed; protected access remains denied", error);
      setUserContext(null);
      setPermissions(null);
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
    if (typeof window !== "undefined") {
      const savedUserStr = window.localStorage.getItem("active_user");
      if (savedUserStr) {
        try {
          const savedUser = JSON.parse(savedUserStr);
          const savedRole = String(savedUser?.role || "").toLowerCase();
          if (savedRole === "super admin" || savedRole === "superadmin") {
            return true;
          }
        } catch (e) {}
      }
    }

    // 1. Implicit Denied if not loaded
    if (!userContext || !permissions) {
      return false;
    }

    const cleanRole = userContext.role.toLowerCase();
    if (cleanRole === "super admin" || cleanRole === "superadmin") {
      return true;
    }

    // 2. Screen Validation Check
    const normalizedModule = module?.toLowerCase();
    const normalizedScreen = screen?.toLowerCase();
    const screenKey = normalizedModule && normalizedScreen
      ? `${normalizedModule}.${normalizedScreen}`
      : normalizedScreen;
    if (screenKey && !permissions.screens.map(s => s.toLowerCase()).includes(screenKey)) {
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
      const actionKey = screenKey || module.toLowerCase();
      const allowedActions = permissions.actions[actionKey] || [];
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
