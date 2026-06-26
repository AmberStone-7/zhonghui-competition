import { describe, expect, test, beforeEach } from "vitest";

async function loadStorage() {
  return await import("../utils/storage");
}

describe("storage utils", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test("getItem returns value when key exists", async () => {
    sessionStorage.setItem("test_key", "hello");
    const { storage } = await loadStorage();
    expect(storage.getItem("test_key")).toBe("hello");
  });

  test("getItem returns null when key does not exist", async () => {
    const { storage } = await loadStorage();
    expect(storage.getItem("nonexistent")).toBeNull();
  });

  test("setItem and getItem round-trip", async () => {
    const { storage } = await loadStorage();
    storage.setItem("roundtrip", "value123");
    expect(storage.getItem("roundtrip")).toBe("value123");
  });

  test("removeItem deletes the key", async () => {
    const { storage } = await loadStorage();
    storage.setItem("to_remove", "x");
    storage.removeItem("to_remove");
    expect(storage.getItem("to_remove")).toBeNull();
  });

  test("getItem does not throw when sessionStorage is unavailable", async () => {
    const originalGetItem = sessionStorage.getItem;
    sessionStorage.getItem = () => { throw new Error("access denied"); };

    const { storage } = await loadStorage();
    expect(storage.getItem("any")).toBeNull();

    sessionStorage.getItem = originalGetItem;
  });

  test("setItem does not throw when sessionStorage is unavailable", async () => {
    const originalSetItem = sessionStorage.setItem;
    sessionStorage.setItem = () => { throw new Error("access denied"); };

    const { storage } = await loadStorage();
    expect(() => storage.setItem("any", "val")).not.toThrow();

    sessionStorage.setItem = originalSetItem;
  });

  test("removeItem does not throw when sessionStorage is unavailable", async () => {
    const originalRemoveItem = sessionStorage.removeItem;
    sessionStorage.removeItem = () => { throw new Error("access denied"); };

    const { storage } = await loadStorage();
    expect(() => storage.removeItem("any")).not.toThrow();

    sessionStorage.removeItem = originalRemoveItem;
  });
});
