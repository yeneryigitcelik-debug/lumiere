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

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    const res = await fetch("/api/admin/products?categoriesOnly=true");
    const data = await res.json();
    if (data.categories) setCategories(data.categories);
  };

  useEffect(() => {
    fetchCategories();
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
