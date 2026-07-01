import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { organizationApi } from "@/lib/api/organization";
import type { OrganizationPayload } from "@/types/organization";

const ORGANIZATION_QUERY_KEY = ["organizations"];

// Get all organizations
export function useOrganizations() {
  return useQuery({
    queryKey: ORGANIZATION_QUERY_KEY,
    queryFn: organizationApi.getAll,
  });
}

// Get single organization
export function useOrganization(id: string) {
  return useQuery({
    queryKey: [...ORGANIZATION_QUERY_KEY, id],
    queryFn: () => organizationApi.getById(id),
    enabled: !!id,
  });
}

// Create organization
export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OrganizationPayload) =>
      organizationApi.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ORGANIZATION_QUERY_KEY,
      });
    },
  });
}

// Update organization
export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: OrganizationPayload;
    }) => organizationApi.update(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ORGANIZATION_QUERY_KEY,
      });
    },
  });
}

// Delete organization
export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      organizationApi.remove(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ORGANIZATION_QUERY_KEY,
      });
    },
  });
}