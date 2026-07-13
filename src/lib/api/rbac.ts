import { axiosInstance } from "./axiosInstance";

export type RbacAction = "view" | "create" | "update" | "delete" | "export" | "approve" | "reject";
export type PermissionMatrix = Record<string, RbacAction[]>;

export interface ApiRole {
  id: string;
  name: string;
  description: string | null;
  organization: string | null;
  clinic: string | null;
  scope: "platform" | "organization" | "clinic";
  permission_matrix: PermissionMatrix;
  created_at: string;
  updated_at: string;
}

export interface PermissionCatalogItem {
  id: string;
  module: string;
  screen: string | null;
  field: string | null;
  action: string;
  code: string;
  name: string;
  is_active: boolean;
}

const unwrapList = <T>(data: T[] | { results: T[] }) => Array.isArray(data) ? data : data.results;

export const rbacApi = {
  async listRoles() {
    const { data } = await axiosInstance.get<ApiRole[] | { results: ApiRole[] }>("/rbac/roles/");
    return unwrapList(data);
  },
  async getRole(id: string) {
    const { data } = await axiosInstance.get<ApiRole>(`/rbac/roles/${id}/`);
    return data;
  },
  async createRole(payload: { name: string; description?: string; permissions: PermissionMatrix }) {
    const { data } = await axiosInstance.post<ApiRole>("/rbac/roles/", payload);
    return data;
  },
  async updateRole(id: string, payload: { name?: string; description?: string; permissions?: PermissionMatrix }) {
    const { data } = await axiosInstance.patch<ApiRole>(`/rbac/roles/${id}/`, payload);
    return data;
  },
  async deleteRole(id: string) {
    await axiosInstance.delete(`/rbac/roles/${id}/`);
  },
  async catalog() {
    const { data } = await axiosInstance.get<PermissionCatalogItem[] | { results: PermissionCatalogItem[] }>("/rbac/permissions/");
    return unwrapList(data);
  },
};
