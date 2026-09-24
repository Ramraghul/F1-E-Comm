import { useState } from 'react';
import { PRODUCT_CATEGORIES, type ProductCategory, type ProductDTO, type TeamDTO } from '@shopswift/shared';

export interface ProductFormValues {
  name: string;
  description: string;
  category: ProductCategory;
  price: number; // dollars in the form, converted to cents on submit
  stock: number;
  sku: string;
  images: string;
  isFeatured: boolean;
  team?: string;
}

function toFormValues(product?: ProductDTO): ProductFormValues {
  return {
    name: product?.name ?? '',
    description: product?.description ?? '',
    category: product?.category ?? PRODUCT_CATEGORIES[0],
    price: product ? product.price / 100 : 0,
    stock: product?.stock ?? 0,
    sku: product?.sku ?? '',
    images: product?.images.join(', ') ?? '',
    isFeatured: product?.isFeatured ?? false,
    team: typeof product?.team === 'object' ? product.team.id : undefined,
  };
}

export function ProductForm({
  product,
  teams,
  submitting,
  onSubmit,
}: {
  product?: ProductDTO;
  teams?: TeamDTO[];
  submitting?: boolean;
  onSubmit: (values: {
    name: string;
    description: string;
    category: ProductCategory;
    price: number;
    stock: number;
    sku: string;
    images: string[];
    isFeatured: boolean;
    team?: string;
  }) => void;
}) {
  const [form, setForm] = useState<ProductFormValues>(() => toFormValues(product));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      name: form.name,
      description: form.description,
      category: form.category,
      price: Math.round(form.price * 100),
      stock: form.stock,
      sku: form.sku,
      images: form.images.split(',').map((s) => s.trim()).filter(Boolean),
      isFeatured: form.isFeatured,
      team: form.team,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {teams && (
        <label className="block">
          <span className="label">Team</span>
          <select
            required
            value={form.team ?? ''}
            onChange={(e) => setForm({ ...form, team: e.target.value })}
            className="input-field"
          >
            <option value="" disabled>
              Select a team…
            </option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <input required placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
      <textarea
        required
        minLength={10}
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        className="input-field min-h-20"
      />
      <div className="grid grid-cols-2 gap-3">
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })} className="input-field">
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.replace('-', ' ')}
            </option>
          ))}
        </select>
        <input required placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="input-field" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="label">Price (USD)</span>
          <input
            required
            type="number"
            min={0}
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            className="input-field"
          />
        </label>
        <label className="block">
          <span className="label">Stock</span>
          <input
            required
            type="number"
            min={0}
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
            className="input-field"
          />
        </label>
      </div>
      <input
        required
        placeholder="Image URLs (comma-separated)"
        value={form.images}
        onChange={(e) => setForm({ ...form, images: e.target.value })}
        className="input-field"
      />
      <label className="flex items-center gap-2 text-sm text-white/70">
        <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
        Featured product
      </label>
      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? 'Saving…' : product ? 'Save Changes' : 'Create Product'}
      </button>
    </form>
  );
}
