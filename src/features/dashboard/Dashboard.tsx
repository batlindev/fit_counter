import { useEffect, useState, type FormEvent } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchProducts } from '../../store/slices/productsSlice'
import { setGoal } from '../../store/slices/authSlice'
import {
  fetchEntries,
  addEntry,
  deleteEntry,
  MEAL_LABELS,
  type MealType,
} from '../../store/slices/diarySlice'
import './Dashboard.css'

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

export default function Dashboard() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const products = useAppSelector((s) => s.products.items)
  const { entries, date, error } = useAppSelector((s) => s.diary)

  const [goalInput, setGoalInput] = useState('')
  const [productId, setProductId] = useState('')
  const [grams, setGrams] = useState('100')
  const [mealType, setMealType] = useState<MealType>('breakfast')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  useEffect(() => {
    if (user) dispatch(fetchEntries({ userId: user.id, date }))
  }, [dispatch, user, date])

  useEffect(() => {
    setGoalInput(user?.dailyKcalGoal != null ? String(user.dailyKcalGoal) : '')
  }, [user?.dailyKcalGoal])

  useEffect(() => {
    if (!productId && products.length > 0) setProductId(products[0].id)
  }, [products, productId])

  async function onSaveGoal(e: FormEvent) {
    e.preventDefault()
    if (!user || !goalInput) return
    await dispatch(setGoal({ userId: user.id, goal: Number(goalInput) }))
  }

  async function onAddEntry(e: FormEvent) {
    e.preventDefault()
    const product = products.find((p) => p.id === productId)
    if (!user || !product || !grams) return
    setSaving(true)
    await dispatch(
      addEntry({
        userId: user.id,
        product,
        grams: Number(grams),
        mealType,
        date,
      }),
    )
    setSaving(false)
  }

  const totalKcal = entries.reduce((sum, e) => sum + e.kcal, 0)
  const goal = user?.dailyKcalGoal ?? null
  const over = goal != null && totalKcal > goal

  return (
    <main>
      <h1>Dziennik — {date}</h1>

      <form className="dash__goal" onSubmit={onSaveGoal}>
        <label>
          Dzienny cel kcal:{' '}
          <input
            type="number"
            min={0}
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
          />
        </label>
        <button type="submit">Zapisz</button>
      </form>

      <div className={`dash__summary${over ? ' over' : ''}`}>
        <span>Spożyto: {totalKcal} kcal</span>
        <span>Cel: {goal ?? '—'} kcal</span>
        {goal != null && <span>Pozostało: {goal - totalKcal} kcal</span>}
      </div>

      <form className="dash__add" onSubmit={onAddEntry}>
        <label>
          Produkt
          <select value={productId} onChange={(e) => setProductId(e.target.value)}>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Gramy
          <input
            type="number"
            min={1}
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
          />
        </label>
        <label>
          Posiłek
          <select value={mealType} onChange={(e) => setMealType(e.target.value as MealType)}>
            {MEAL_ORDER.map((m) => (
              <option key={m} value={m}>
                {MEAL_LABELS[m]}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={saving || products.length === 0}>
          Dodaj
        </button>
      </form>

      {error && <p className="dash__err">{error}</p>}
      {products.length === 0 && <p>Brak produktów — dodaj je na stronie Produkty.</p>}

      {MEAL_ORDER.map((meal) => {
        const mealEntries = entries.filter((e) => e.meal_type === meal)
        if (mealEntries.length === 0) return null
        return (
          <section className="dash__meal" key={meal}>
            <h2>{MEAL_LABELS[meal]}</h2>
            {mealEntries.map((e) => (
              <div className="dash__entry" key={e.id}>
                <div>
                  <div>
                    {e.product_name} — {e.grams} g
                  </div>
                  <div className="dash__entry-macros">
                    {e.kcal} kcal · B {e.protein}g · T {e.fat}g · W {e.carbs}g
                  </div>
                </div>
                <button onClick={() => dispatch(deleteEntry(e.id))} title="Usuń">
                  ✕
                </button>
              </div>
            ))}
          </section>
        )
      })}
    </main>
  )
}
