import { useEffect, useState, type FormEvent } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchProducts, addProduct } from '../../store/slices/productsSlice'
import './Products.css'

const emptyForm = {
  name: '',
  kcal: '',
  protein: '',
  fat: '',
  carbs: '',
  fiber: '',
  salt: '',
}

export default function Products() {
  const dispatch = useAppDispatch()
  const { items, status, error } = useAppSelector((s) => s.products)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  function update(field: keyof typeof emptyForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await dispatch(
      addProduct({
        name: form.name.trim(),
        kcal: Number(form.kcal),
        protein: Number(form.protein),
        fat: Number(form.fat),
        carbs: Number(form.carbs),
        fiber: form.fiber ? Number(form.fiber) : null,
        salt: form.salt ? Number(form.salt) : null,
      }),
    )
    setSaving(false)
    if (addProduct.fulfilled.match(res)) setForm(emptyForm)
  }

  return (
    <main>
      <h1>Produkty</h1>

      <form className="products__form" onSubmit={onSubmit}>
        <h2>Dodaj produkt (wartości na 100 g)</h2>
        <label className="wide">
          Nazwa
          <input
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            required
          />
        </label>
        <label>
          Kcal
          <input
            type="number"
            min={0}
            step="0.1"
            value={form.kcal}
            onChange={(e) => update('kcal', e.target.value)}
            required
          />
        </label>
        <label>
          Białko (g)
          <input
            type="number"
            min={0}
            step="0.1"
            value={form.protein}
            onChange={(e) => update('protein', e.target.value)}
            required
          />
        </label>
        <label>
          Tłuszcz (g)
          <input
            type="number"
            min={0}
            step="0.1"
            value={form.fat}
            onChange={(e) => update('fat', e.target.value)}
            required
          />
        </label>
        <label>
          Węglowodany (g)
          <input
            type="number"
            min={0}
            step="0.1"
            value={form.carbs}
            onChange={(e) => update('carbs', e.target.value)}
            required
          />
        </label>
        <label>
          Błonnik (g)
          <input
            type="number"
            min={0}
            step="0.1"
            value={form.fiber}
            onChange={(e) => update('fiber', e.target.value)}
          />
        </label>
        <label>
          Sól (g)
          <input
            type="number"
            min={0}
            step="0.1"
            value={form.salt}
            onChange={(e) => update('salt', e.target.value)}
          />
        </label>
        <button type="submit" disabled={saving}>
          {saving ? 'Zapisywanie…' : 'Dodaj produkt'}
        </button>
        {error && <p className="products__err">{error}</p>}
      </form>

      {status === 'loading' && <p>Ładowanie…</p>}

      <ul className="products__list">
        {items.map((p) => (
          <li key={p.id} className="products__item">
            <span className="products__item-name">{p.name}</span>
            <span className="products__item-macros">
              {p.kcal} kcal · B {p.protein}g · T {p.fat}g · W {p.carbs}g
              {p.fiber != null ? ` · Błonnik ${p.fiber}g` : ''}
              {p.salt != null ? ` · Sól ${p.salt}g` : ''}
            </span>
          </li>
        ))}
      </ul>
    </main>
  )
}
