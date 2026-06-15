/**
 * Mock multi-tenant context. In production this would hydrate from the
 * authenticated session (JWT claims → organization_id / clinic_id).
 */
export const organizations = [
  { id: "org_apollo", name: "Apollo Health Group" },
  { id: "org_fortis", name: "Fortis Healthcare" },
  { id: "org_manipal", name: "Manipal Hospitals" },
  { id: "org_max", name: "Max Healthcare" },
  { id: "org_aiims", name: "AIIMS Network" },
];

export const clinics = [
  { id: "clinic_bandra", organization_id: "org_apollo", name: "Apollo — Bandra" },
  { id: "clinic_indira", organization_id: "org_fortis", name: "Fortis — Indiranagar" },
  { id: "clinic_gachi", organization_id: "org_manipal", name: "Manipal — Gachibowli" },
  { id: "clinic_saket", organization_id: "org_max", name: "Max — Saket" },
  { id: "clinic_anna", organization_id: "org_aiims", name: "AIIMS — Anna Nagar" },
];

export const currentUser = {
  id: "user_riya",
  name: "Dr. Riya Iyer",
  email: "riya.iyer@helix.health",
  organization_id: "org_apollo",
  clinic_id: "clinic_bandra",
  role: "Organization Admin",
};