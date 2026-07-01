import { axiosInstance } from "./axiosInstance";

export interface TaxConfiguration {
  id?: string;
  name: string;
  rate: number;
  is_active: boolean;
}

export interface LineItem {
  id?: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  tax_amount?: number;
  total_amount?: number;
}

export interface Invoice {
  id?: string;
  patient: string;
  patient_name?: string;
  patient_phone?: string;
  invoice_number?: string;
  date?: string;
  sub_total?: number;
  cgst_amount?: number;
  sgst_amount?: number;
  igst_amount?: number;
  total_amount?: number;
  status: "UNPAID" | "PAID" | "PARTIALLY_PAID" | "VOID";
  line_items: LineItem[];
}

export interface PaymentTransaction {
  id?: string;
  invoice: string;
  transaction_id?: string;
  amount: number;
  method: "CASH" | "CARD" | "UPI" | "NETBANKING" | "RAZORPAY";
  status?: "PENDING" | "SUCCESS" | "FAILED";
  payment_gateway_response?: any;
}

export const billingApi = {
  // Taxes
  getTaxes: async () => {
    const response = await axiosInstance.get<TaxConfiguration[]>("/billing/taxes/");
    return response.data;
  },

  // Invoices
  getInvoices: async () => {
    const response = await axiosInstance.get<Invoice[]>("/billing/invoices/");
    return response.data;
  },

  createInvoice: async (data: { patient: string; line_items: LineItem[] }) => {
    const response = await axiosInstance.post<Invoice>("/billing/invoices/", data);
    return response.data;
  },

  getInvoiceById: async (id: string) => {
    const response = await axiosInstance.get<Invoice>(`/billing/invoices/${id}/`);
    return response.data;
  },

  payUpi: async (id: string) => {
    const response = await axiosInstance.post<{ upi_string: string }>(
      `/billing/invoices/${id}/pay-upi/`
    );
    return response.data;
  },

  createRazorpayOrder: async (id: string) => {
    const response = await axiosInstance.post<any>(
      `/billing/invoices/${id}/razorpay-order/`
    );
    return response.data;
  },

  recordPayment: async (
    id: string,
    data: { amount: number; method: string; payment_gateway_response?: any }
  ) => {
    const response = await axiosInstance.post<PaymentTransaction>(
      `/billing/invoices/${id}/record-payment/`,
      data
    );
    return response.data;
  },

  // Transactions
  getTransactions: async () => {
    const response = await axiosInstance.get<PaymentTransaction[]>("/billing/transactions/");
    return response.data;
  },

  // Delete/void an invoice
  deleteInvoice: async (id: string) => {
    const response = await axiosInstance.delete(`/billing/invoices/${id}/`);
    return response.data;
  },
};
