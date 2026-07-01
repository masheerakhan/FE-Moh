export interface Organization {
  id: string;

  name: string;
  code: string;
  email: string;
  phone: string;

  website?: string;
  logo?: string;

  gst_number?: string;
  license_number?: string;

  address?: string;
  city?: string;
  state?: string;
  country: string;
  postal_code?: string;

  timezone: string;
  currency: string;

  status: "ACTIVE" | "INACTIVE";

  created_at: string;
  updated_at: string;

  is_active: boolean;
  is_deleted: boolean;
}

export type OrganizationPayload = Omit<Organization, "id" | "created_at" | "updated_at" | "is_active" | "is_deleted">;