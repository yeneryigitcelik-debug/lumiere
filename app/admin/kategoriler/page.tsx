"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  _count?: { products: number };
}

async function readCategories(): Promise<Category[]> {
  const res = await fetch("/api/admin/products?categoriesOnly=true");
  if (!res.ok) throw new Error("request_failed");
  const data: unknown = await res.json();
  const cats = (data as { categories?: unknown } | null)?.categories;
  if (!Array.isArray(cats)) throw new Error("bad_response");
  return cats as Category[];
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(false);

  const fetchCategories = async () => {
    setListLoading(true);
    setListError(false);
    try {
      const cats = await readCategories();
      setCategories(cats);
    } catch {
      setListError(true);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    readCategories()
      .then((cats) => {
        if (!cancelled) setCategories(cats);
      })
      .catch(() => {
        if (!cancelled) setListError(true);
      })
      .finally(() => {
        if (!cancelled) setListLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setLoading(true);

    // For now, categories are created via direct DB or seed
    // This would call a dedicated categories API
    setNewName("");
    setLoading(false);
    fetchCategories();
  };

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-stone-900">
        Kategoriler
      </h1>

      <form onSubmit={handleAdd} className="mt-6 flex gap-2">
        <Input
          placeholder="Yeni kategori adi"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          Ekle
        </Button>
      </form>

      {listLoading && (
        <p role="status" className="mt-6 text-sm text-stone-500">
          Kategoriler yükleniyor...
        </p>
      )}

      {!listLoading && listError && (
        <div
          role="alert"
          className="mt-6 flex items-center justify-between rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <span>Kategoriler yüklenemedi.</span>
          <Button type="button" size="sm" variant="outline" onClick={fetchCategories}>
            Tekrar dene
          </Button>
        </div>
      )}

      {!listLoading && !listError && categories.length === 0 && (
        <p className="mt-6 text-sm text-stone-500">Henüz kategori yok.</p>
      )}

      <div className="mt-6 space-y-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between rounded-md border border-stone-200 p-3"
          >
            <div className="flex items-center gap-3">
              <span className="font-medium text-stone-900">{cat.name}</span>
              <Badge variant={cat.isActive ? "success" : "default"}>
                {cat.isActive ? "Aktif" : "Pasif"}
              </Badge>
            </div>
            <button className="text-stone-400 hover:text-red-500">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
