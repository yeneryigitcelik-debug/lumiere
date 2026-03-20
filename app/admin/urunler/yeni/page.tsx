"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    shortDescription: "",
    price: "",
    compareAtPrice: "",
    sku: "",
    stockQuantity: "0",
    categoryId: "",
    material: "",
    weight: "",
    dimensions: "",
    isFeatured: false,
    metaTitle: "",
    metaDescription: "",
  });

  useEffect(() => {
    fetch("/api/admin/products?categoriesOnly=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          compareAtPrice: form.compareAtPrice
            ? parseFloat(form.compareAtPrice)
            : null,
          stockQuantity: parseInt(form.stockQuantity),
          categoryId: form.categoryId || null,
        }),
      });

      if (res.ok) {
        router.push("/admin/urunler");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-stone-900">
        Yeni Urun
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-4">
        <div>
          <label className="text-sm font-medium text-stone-700">Urun Adi</label>
          <Input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-stone-700">
            Kisa Aciklama
          </label>
          <Input
            name="shortDescription"
            value={form.shortDescription}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-stone-700">Aciklama</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="mt-1 flex w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-stone-700">
              Fiyat (TL)
            </label>
            <Input
              name="price"
              type="number"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700">
              Karsilastirma Fiyati
            </label>
            <Input
              name="compareAtPrice"
              type="number"
              step="0.01"
              value={form.compareAtPrice}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-stone-700">SKU</label>
            <Input
              name="sku"
              value={form.sku}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700">Stok</label>
            <Input
              name="stockQuantity"
              type="number"
              value={form.stockQuantity}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-stone-700">Kategori</label>
          <select
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            className="mt-1 flex h-10 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
          >
            <option value="">Kategori Secin</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-stone-700">
              Malzeme
            </label>
            <Input
              name="material"
              value={form.material}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700">
              Agirlik
            </label>
            <Input
              name="weight"
              value={form.weight}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700">
              Boyutlar
            </label>
            <Input
              name="dimensions"
              value={form.dimensions}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isFeatured"
            id="isFeatured"
            checked={form.isFeatured}
            onChange={handleChange}
            className="h-4 w-4 rounded border-stone-300"
          />
          <label htmlFor="isFeatured" className="text-sm text-stone-700">
            One cikan urun
          </label>
        </div>

        <div className="border-t border-stone-200 pt-4">
          <h3 className="text-sm font-medium text-stone-700">SEO</h3>
          <div className="mt-2 space-y-3">
            <Input
              name="metaTitle"
              placeholder="Meta Title"
              value={form.metaTitle}
              onChange={handleChange}
            />
            <Input
              name="metaDescription"
              placeholder="Meta Description"
              value={form.metaDescription}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Kaydediliyor..." : "Urun Olustur"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Iptal
          </Button>
        </div>
      </form>
    </div>
  );
}
