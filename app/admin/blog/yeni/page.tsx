"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewBlogPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    tags: "",
    status: "DRAFT",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/admin/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    });

    if (res.ok) {
      router.push("/admin/blog");
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-stone-900">
        Yeni Blog Yazisi
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-4">
        <div>
          <label className="text-sm font-medium text-stone-700">Baslik</label>
          <Input name="title" value={form.title} onChange={handleChange} required className="mt-1" />
        </div>

        <div>
          <label className="text-sm font-medium text-stone-700">Ozet</label>
          <Input name="excerpt" value={form.excerpt} onChange={handleChange} className="mt-1" />
        </div>

        <div>
          <label className="text-sm font-medium text-stone-700">Icerik (HTML)</label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            required
            rows={12}
            className="mt-1 flex w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-mono focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-stone-700">
            Etiketler (virgul ile ayirin)
          </label>
          <Input name="tags" value={form.tags} onChange={handleChange} placeholder="taki, bakim, trend" className="mt-1" />
        </div>

        <div>
          <label className="text-sm font-medium text-stone-700">Durum</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="mt-1 flex h-10 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
          >
            <option value="DRAFT">Taslak</option>
            <option value="PUBLISHED">Yayinla</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Kaydediliyor..." : "Olustur"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Iptal
          </Button>
        </div>
      </form>
    </div>
  );
}
