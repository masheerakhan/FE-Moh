import { axiosInstance } from "./axiosInstance";

export interface BrandStylingConfig {
  id?: string;
  brand_name: string;
  custom_domain?: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color?: string; // CSS HSL or Hex code
  gradient_primary?: string; // CSS linear gradient string
  accent_color?: string;
  is_active?: boolean;
}

export const whitelabelApi = {
  // Fetch active styling configuration overrides per tenant
  getStylingConfig: async () => {
    const response = await axiosInstance.get<BrandStylingConfig>("/whitelabel/styling/");
    return response.data;
  },

  // Save/Update brand design configurations and domains
  saveStylingConfig: async (data: BrandStylingConfig) => {
    const response = await axiosInstance.post<BrandStylingConfig>("/whitelabel/styling/", data);
    return response.data;
  },

  // Inject custom CSS styling variables to HTML document root dynamically
  applyTheme: (config: BrandStylingConfig) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (config.primary_color) {
      root.style.setProperty("--primary", config.primary_color);
    }
    if (config.gradient_primary) {
      root.style.setProperty("--gradient-primary", config.gradient_primary);
    }
    if (config.accent_color) {
      root.style.setProperty("--accent", config.accent_color);
    }
  },
};
