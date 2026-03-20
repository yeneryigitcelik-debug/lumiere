import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductEditForm } from "@/components/admin/product-edit-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: true, variants: true },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-stone-900">
        Urun Duzenle: {product.name}
      </h1>
      <ProductEditForm
        product={{
          ...product,
          price: Number(product.price),
          compareAtPrice: product.compareAtPrice
            ? Number(product.compareAtPrice)
            : null,
        }}
        categories={categories}
      />
    </div>
  );
}
