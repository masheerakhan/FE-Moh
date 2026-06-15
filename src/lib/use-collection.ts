import { useCallback, useEffect, useState } from "react";

/**
 * Lightweight localStorage-backed collection for prototype CRUD.
 * Tenant-aware: keys are scoped per organization/clinic when provided.
 */
export function useCollection<T extends { id: string }>(
  key: string,
  seed: T[] = [],
  scope?: { organization_id?: string; clinic_id?: string },
) {
  const storageKey = [
    "helix",
    scope?.organization_id ?? "org_default",
    scope?.clinic_id ?? "clinic_default",
    key,
  ].join(":");

  const [items, setItems] = useState<T[]>(() => {
    if (typeof window === "undefined") return seed;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw) as T[];
    } catch {
      /* ignore */
    }
    return seed;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, storageKey]);

  const create = useCallback((item: Omit<T, "id"> & { id?: string }) => {
    const next = { ...(item as T), id: item.id ?? crypto.randomUUID() } as T;
    setItems((prev) => [next, ...prev]);
    return next;
  }, []);

  const update = useCallback((id: string, patch: Partial<T>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const reset = useCallback(() => setItems(seed), [seed]);

  return { items, create, update, remove, reset, setItems };
}