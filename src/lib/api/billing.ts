import { axiosInstance } from "./axiosInstance";

export type InvoiceStatus = "UNPAID" | "PAID" | "PARTIALLY_PAID" | "VOID";
export type PaymentMethod = "CASH" | "CARD" | "UPI" | "NETBANKING" | "RAZORPAY";

export interface TaxConfiguration { id: string; name: string; rate: string; is_active: boolean }
export interface BillingPatient { id: string; name: string; phone: string; date_of_birth?: string; gender?: string; clinic_id?: string; clinic_name?: string }
export interface LineItemInput { item_name: string; service_type?: string; quantity: number; unit_price: number; discount_amount?: number; tax_rate: number }
export interface LineItem extends LineItemInput { id: string; taxable_amount: string; tax_amount: string; total_amount: string }
export interface PaymentSplit { method: PaymentMethod; amount: number; reference_number?: string; notes?: string }
export interface PaymentTransaction { id: string; invoice: string; transaction_id: string; amount: string; method: PaymentMethod; status: string; reference_number: string; notes: string; payment_date: string; received_by: string }
export interface Invoice {
  id: string; patient: string; appointment?: string; patient_name: string; patient_phone: string;
  patient_identifier: string; clinic_name?: string; doctor_name?: string; consultation_type?: string;
  invoice_number: string; date: string; sub_total: string; discount_amount: string; taxable_amount: string;
  cgst_amount: string; sgst_amount: string; igst_amount: string; total_amount: string; paid_amount: string;
  due_amount: string; status: InvoiceStatus; notes: string; line_items: LineItem[];
  transactions: PaymentTransaction[]; audit_logs: Array<Record<string, unknown>>;
}
export interface BillingSummary { total_invoiced: string; total_collected: string; total_cash_collected: string; total_online_collected: string; total_outstanding: string; total_discount: string; tax_total: string }
export interface Paginated<T> { count: number; next: string | null; previous: string | null; results: T[]; summary?: BillingSummary }
export interface PatientContext {
  patient: BillingPatient;
  summary: { total_invoiced: string; total_paid: string; total_due: string; advance_credit: string; latest_invoice?: string; latest_payment?: string; bill_count: number };
  recent_invoices: Invoice[]; recent_payments: PaymentTransaction[]; recent_logs: Array<Record<string, unknown>>;
}
export interface PatientBillingRow { patient_id: string; patient_name: string; mobile: string; total_invoiced: string; total_paid: string; outstanding_due: string; advance_credit: string; last_invoice_date?: string; last_payment_date?: string; bill_count: number }

export const billingApi = {
  getTaxes: async () => (await axiosInstance.get<TaxConfiguration[]>("/billing/taxes/")).data,
  searchPatients: async (q: string) => (await axiosInstance.get<{ results: BillingPatient[] }>("/billing/invoices/patient-search/", { params: { q } })).data.results,
  getInvoices: async (params: Record<string, string | number | undefined> = {}) => (await axiosInstance.get<Paginated<Invoice>>("/billing/invoices/", { params })).data,
  getInvoiceById: async (id: string) => (await axiosInstance.get<Invoice>(`/billing/invoices/${id}/`)).data,
  getPatientContext: async (patient: string) => (await axiosInstance.get<PatientContext>("/billing/invoices/patient-context/", { params: { patient } })).data,
  getPatientWise: async (params: Record<string, string | number | undefined> = {}) => (await axiosInstance.get<Paginated<PatientBillingRow>>("/billing/invoices/patient-wise/", { params })).data,
  createInvoice: async (data: { patient: string; appointment?: string; notes?: string; idempotency_key: string; line_items: LineItemInput[]; payment_splits: PaymentSplit[] }) => (await axiosInstance.post<Invoice>("/billing/invoices/", data)).data,
  recordPayment: async (id: string, payment_splits: PaymentSplit[]) => (await axiosInstance.post(`/billing/invoices/${id}/record-payment/`, { payment_splits })).data,
  voidInvoice: async (id: string, reason = "") => (await axiosInstance.delete(`/billing/invoices/${id}/`, { data: { reason } })).data,
  getTransactions: async (params: Record<string, string | number | undefined> = {}) => (await axiosInstance.get<Paginated<PaymentTransaction>>("/billing/transactions/", { params })).data,
};
