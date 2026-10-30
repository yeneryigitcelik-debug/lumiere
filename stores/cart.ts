import { create } from "zustand";
import {
  persist,
  type PersistStorage,
  type StorageValue,
} from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  hasHydrated: boolean;
  storageWarning: string | null;
  /** Returns true only when the cart was actually changed. */
  addItem: (item: CartItem) => boolean;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    variantId?: string
  ) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

type PersistedCart = Pick<CartState, "items">;

export const CART_STORAGE_KEY = "bycollection-cart";
export const CART_STORAGE_VERSION = 1;

export const CART_WARNING_UNAVAILABLE =
  "Tarayıcı depolaması kullanılamıyor. Sepetiniz yalnızca bu sayfa açıkken saklanacak.";
export const CART_WARNING_WRITE =
  "Sepetiniz tarayıcıya kaydedilemedi. Değişiklikler yalnızca bu sayfa açıkken saklanacak.";
export const CART_WARNING_CORRUPT =
  "Kayıtlı sepet verisi okunamadı ve yok sayıldı.";
export const CART_WARNING_OMITTED =
  "Kayıtlı sepetteki geçersiz bazı ürünler kaldırıldı.";
export const CART_WARNING_INVALID_ITEM =
  "Ürün bilgisi geçersiz olduğu için sepete eklenemedi.";
export const CART_WARNING_LIMIT =
  "Sepet adedi veya tutarı hesaplanamayacak kadar büyük olacağı için işlem yapılamadı.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalString(value: unknown): string | undefined | false {
  if (value === undefined || value === null) return undefined;
  return typeof value === "string" ? value : false;
}

function isValidQuantity(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function sameLine(a: CartItem, productId: string, variantId?: string) {
  return a.productId === productId && a.variantId === variantId;
}

/** True when every line and the cart totals are representable. */
function withinLimits(items: CartItem[]): boolean {
  let quantity = 0;
  let cost = 0;
  for (const i of items) {
    const line = i.price * i.quantity;
    if (!Number.isSafeInteger(i.quantity) || !Number.isFinite(line)) return false;
    quantity += i.quantity;
    cost += line;
  }
  return Number.isSafeInteger(quantity) && Number.isFinite(cost);
}

/** Validates a single cart item. Returns null when the item is unusable. */
export function normalizeCartItem(raw: unknown): CartItem | null {
  if (!isRecord(raw)) return null;
  const { productId, name, price, quantity, slug } = raw;
  if (typeof productId !== "string" || productId.length === 0) return null;
  if (typeof name !== "string") return null;
  if (typeof slug !== "string" || slug.length === 0) return null;
  if (typeof price !== "number" || !Number.isFinite(price) || price < 0)
    return null;
  if (!isValidQuantity(quantity)) return null;
  if (!Number.isFinite(price * quantity)) return null;

  const variantId = optionalString(raw.variantId);
  const image = optionalString(raw.image);
  const variantName = optionalString(raw.variantName);
  const categorySlug = optionalString(raw.categorySlug);
  if (
    variantId === false ||
    image === false ||
    variantName === false ||
    categorySlug === false
  )
    return null;

  const item: CartItem = { productId, name, price, quantity, slug };
  if (variantId !== undefined) item.variantId = variantId;
  if (image !== undefined) item.image = image;
  if (variantName !== undefined) item.variantName = variantName;
  if (categorySlug !== undefined && categorySlug.length > 0)
    item.categorySlug = categorySlug;
  return item;
}

/** Pure normalization of persisted cart items. */
export function normalizeCartItems(raw: unknown): {
  items: CartItem[];
  omitted: number;
} {
  if (raw === undefined || raw === null) return { items: [], omitted: 0 };
  if (!Array.isArray(raw)) return { items: [], omitted: 1 };

  let items: CartItem[] = [];
  let omitted = 0;
  for (const entry of raw) {
    const item = normalizeCartItem(entry);
    if (!item) {
      omitted++;
      continue;
    }
    const index = items.findIndex((i) =>
      sameLine(i, item.productId, item.variantId)
    );
    const candidate =
      index === -1
        ? [...items, item]
        : items.map((existing, i) =>
            i === index
              ? { ...existing, quantity: existing.quantity + item.quantity }
              : existing
          );
    if (withinLimits(candidate)) items = candidate;
    else omitted++;
  }
  return { items, omitted };
}

// --- Storage -------------------------------------------------------------

const memory = new Map<string, StorageValue<PersistedCart>>();
let writeFailed = false;
// Set after a failed localStorage read. The saved cart was never read, so this
// module never writes or removes it for the rest of the session. A fresh
// module or page reload resets it.
let readFailed = false;
let pendingWarning: string | null = null;

function addPendingWarning(message: string) {
  if (!pendingWarning) pendingWarning = message;
  else if (!pendingWarning.includes(message))
    pendingWarning = `${pendingWarning} ${message}`;
}

function getLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

const safeStorage: PersistStorage<PersistedCart> = {
  getItem: (name) => {
    pendingWarning = null;
    // Memory-only mode: later rehydrations never touch the unread stored cart.
    if (readFailed) {
      addPendingWarning(CART_WARNING_UNAVAILABLE);
      return memory.get(name) ?? null;
    }
    let raw: string | null;
    try {
      const ls = getLocalStorage();
      if (!ls) return memory.get(name) ?? null;
      raw = ls.getItem(name);
    } catch {
      // Only a thrown read counts. No window (SSR) is not flagged.
      readFailed = true;
      addPendingWarning(CART_WARNING_UNAVAILABLE);
      return memory.get(name) ?? null;
    }
    if (writeFailed && memory.has(name)) {
      addPendingWarning(CART_WARNING_WRITE);
      return memory.get(name) ?? null;
    }
    if (raw === null) {
      // Successful read with no saved cart: the stored cart is explicitly empty.
      // Drop the memory copy so a later failed read cannot resurrect it.
      memory.delete(name);
      return { state: { items: [] }, version: CART_STORAGE_VERSION };
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!isRecord(parsed)) {
        addPendingWarning(CART_WARNING_CORRUPT);
        return null;
      }
      const version =
        typeof parsed.version === "number" && Number.isFinite(parsed.version)
          ? parsed.version
          : 0;
      const state = isRecord(parsed.state)
        ? (parsed.state as unknown as PersistedCart)
        : ({ items: parsed.state } as unknown as PersistedCart);
      return { state, version };
    } catch {
      addPendingWarning(CART_WARNING_CORRUPT);
      return null;
    }
  },
  setItem: (name, value) => {
    memory.set(name, value);
    // A write here would overwrite the unread saved cart, so keep it in memory only.
    if (readFailed) return;
    try {
      const ls = getLocalStorage();
      if (!ls) return;
      ls.setItem(name, JSON.stringify(value));
      writeFailed = false;
    } catch {
      writeFailed = true;
      if (useCartStore.getState().storageWarning !== CART_WARNING_WRITE) {
        useCartStore.setState({ storageWarning: CART_WARNING_WRITE });
      }
    }
  },
  removeItem: (name) => {
    memory.delete(name);
    // Never remove an unread saved cart.
    if (readFailed) return;
    try {
      getLocalStorage()?.removeItem(name);
    } catch {
      // Storage unavailable; in-memory copy already removed.
    }
  },
};

let hydrating = false;

/**
 * Bounded, non-recursive initial hydration barrier. Must run before any
 * mutation so a write never overwrites an unread persisted cart.
 * Returns true only when hydration has actually completed. No state is set here:
 * any setState before the read would persist and overwrite the stored cart.
 */
export function ensureInitialHydration(): boolean {
  if (useCartStore.getState().hasHydrated) return true;
  if (hydrating) return false;
  hydrating = true;
  try {
    const result = useCartStore.persist.rehydrate() as unknown;
    if (
      result &&
      typeof (result as Promise<void>).then === "function" &&
      typeof (result as Promise<void>).catch === "function"
    ) {
      (result as Promise<void>).catch(() => {});
    }
  } catch {
    // Hydration failed; hasHydrated below reports the truthful status.
  } finally {
    hydrating = false;
  }
  return useCartStore.getState().hasHydrated;
}

function safeTotal(items: unknown, pick: (item: CartItem) => number) {
  if (!Array.isArray(items)) return 0;
  return items.reduce<number>((sum, item: CartItem) => {
    const next = sum + pick(item);
    return Number.isFinite(next) ? next : sum;
  }, 0);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,
      storageWarning: null,

      addItem: (input) => {
        // Hydration still pending: reject without touching state/storage.
        if (!ensureInitialHydration()) return false;
        const item = normalizeCartItem(input);
        if (!item) {
          set({ storageWarning: CART_WARNING_INVALID_ITEM });
          return false;
        }
        const { items } = get();
        const exists = items.some((i) =>
          sameLine(i, item.productId, item.variantId)
        );
        const next = exists
          ? items.map((i) =>
              sameLine(i, item.productId, item.variantId)
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            )
          : [...items, item];
        if (!withinLimits(next)) {
          set({ storageWarning: CART_WARNING_LIMIT });
          return false;
        }
        set({ items: next });
        return true;
      },

      removeItem: (productId, variantId) => {
        if (!ensureInitialHydration()) return;
        set((state) => ({
          items: state.items.filter((i) => !sameLine(i, productId, variantId)),
        }));
      },

      updateQuantity: (productId, quantity, variantId) => {
        if (!ensureInitialHydration()) return;
        if (typeof quantity !== "number" || !Number.isFinite(quantity)) return;
        if (quantity <= 0) {
          set((state) => ({
            items: state.items.filter(
              (i) => !sameLine(i, productId, variantId)
            ),
          }));
          return;
        }
        if (!Number.isSafeInteger(quantity)) return;
        const next = get().items.map((i) =>
          sameLine(i, productId, variantId) ? { ...i, quantity } : i
        );
        if (!withinLimits(next)) {
          set({ storageWarning: CART_WARNING_LIMIT });
          return;
        }
        set({ items: next });
      },

      clearCart: () => {
        if (!ensureInitialHydration()) return;
        set({ items: [] });
      },

      totalItems: () => safeTotal(get().items, (item) => item.quantity),

      totalPrice: () =>
        safeTotal(get().items, (item) => item.price * item.quantity),
    }),
    {
      name: CART_STORAGE_KEY,
      version: CART_STORAGE_VERSION,
      storage: safeStorage,
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
      migrate: (persisted) => persisted as PersistedCart,
      merge: (persisted, current) => {
        if (!isRecord(persisted)) return current;
        const { items, omitted } = normalizeCartItems(persisted.items);
        if (omitted > 0) addPendingWarning(CART_WARNING_OMITTED);
        return { ...current, items };
      },
      onRehydrateStorage: () => (_state, error) => {
        const warning = error ? CART_WARNING_CORRUPT : pendingWarning;
        pendingWarning = null;
        const current = useCartStore.getState();
        if (current.hasHydrated && current.storageWarning === warning) return;
        useCartStore.setState({ hasHydrated: true, storageWarning: warning });
      },
    }
  )
);
