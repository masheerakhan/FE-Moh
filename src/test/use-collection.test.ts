import { describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useCollection } from "@/lib/use-collection";

type Row = { id: string; name: string; status?: string };

describe("useCollection (tenant-scoped CRUD)", () => {
  it("creates items with generated ids and prepends them", () => {
    const { result } = renderHook(() =>
      useCollection<Row>("rows", [], { organization_id: "o1", clinic_id: "c1" }),
    );
    act(() => { result.current.create({ name: "Alice" }); });
    act(() => { result.current.create({ name: "Bob" }); });
    expect(result.current.items.map((r) => r.name)).toEqual(["Bob", "Alice"]);
    expect(result.current.items[0].id).toBeTruthy();
  });

  it("updates a row by id", () => {
    const { result } = renderHook(() =>
      useCollection<Row>("rows-u", [{ id: "1", name: "A", status: "Pending" }]),
    );
    act(() => { result.current.update("1", { status: "Ready" }); });
    expect(result.current.items[0].status).toBe("Ready");
  });

  it("removes a row by id", () => {
    const { result } = renderHook(() =>
      useCollection<Row>("rows-d", [
        { id: "1", name: "A" },
        { id: "2", name: "B" },
      ]),
    );
    act(() => { result.current.remove("1"); });
    expect(result.current.items.map((r) => r.id)).toEqual(["2"]);
  });

  it("persists items per tenant scope in localStorage", () => {
    const { result, unmount } = renderHook(() =>
      useCollection<Row>("rows-p", [], { organization_id: "orgA", clinic_id: "c1" }),
    );
    act(() => { result.current.create({ id: "x", name: "Persisted" }); });
    unmount();
    const { result: r2 } = renderHook(() =>
      useCollection<Row>("rows-p", [], { organization_id: "orgA", clinic_id: "c1" }),
    );
    expect(r2.current.items).toHaveLength(1);
    expect(r2.current.items[0].name).toBe("Persisted");

    const { result: r3 } = renderHook(() =>
      useCollection<Row>("rows-p", [], { organization_id: "orgB", clinic_id: "c1" }),
    );
    expect(r3.current.items).toHaveLength(0);
  });
});