import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabaseClient'
import type { Product } from './productsSlice'

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Śniadanie',
  lunch: 'Obiad',
  dinner: 'Kolacja',
  snack: 'Przekąska',
}

// zapis "zamrożony" w momencie dodania — zmiana produktu w bazie
// nie wpływa wstecz na wpisy w dzienniku
export interface DiaryEntry {
  id: string
  user_id: string
  product_id: string | null
  product_name: string
  grams: number
  kcal: number
  protein: number
  fat: number
  carbs: number
  meal_type: MealType
  entry_date: string
}

interface DiaryState {
  entries: DiaryEntry[]
  date: string
  status: 'idle' | 'loading' | 'error'
  error: string | null
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

const initialState: DiaryState = {
  entries: [],
  date: todayIso(),
  status: 'idle',
  error: null,
}

export const fetchEntries = createAsyncThunk<
  DiaryEntry[],
  { userId: string; date: string }
>('diary/fetch', async ({ userId, date }) => {
  const { data, error } = await supabase
    .from('diary_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('entry_date', date)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as DiaryEntry[]
})

export const addEntry = createAsyncThunk<
  DiaryEntry,
  {
    userId: string
    product: Product
    grams: number
    mealType: MealType
    date: string
  },
  { rejectValue: string }
>('diary/add', async ({ userId, product, grams, mealType, date }, { rejectWithValue }) => {
  const factor = grams / 100
  const payload = {
    user_id: userId,
    product_id: product.id,
    product_name: product.name,
    grams,
    kcal: Math.round(product.kcal * factor),
    protein: +(product.protein * factor).toFixed(1),
    fat: +(product.fat * factor).toFixed(1),
    carbs: +(product.carbs * factor).toFixed(1),
    meal_type: mealType,
    entry_date: date,
  }
  const { data, error } = await supabase
    .from('diary_entries')
    .insert(payload)
    .select()
    .single()
  if (error) return rejectWithValue(error.message)
  return data as DiaryEntry
})

export const deleteEntry = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('diary/delete', async (id, { rejectWithValue }) => {
  const { error } = await supabase.from('diary_entries').delete().eq('id', id)
  if (error) return rejectWithValue(error.message)
  return id
})

const diarySlice = createSlice({
  name: 'diary',
  initialState,
  reducers: {
    setDate(state, action: { payload: string }) {
      state.date = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEntries.pending, (s) => {
        s.status = 'loading'
      })
      .addCase(fetchEntries.fulfilled, (s, a) => {
        s.status = 'idle'
        s.entries = a.payload
      })
      .addCase(fetchEntries.rejected, (s, a) => {
        s.status = 'error'
        s.error = a.error.message ?? 'Błąd pobierania dziennika'
      })
      .addCase(addEntry.fulfilled, (s, a) => {
        s.entries.push(a.payload)
      })
      .addCase(addEntry.rejected, (s, a) => {
        s.error = a.payload ?? 'Błąd dodawania wpisu'
      })
      .addCase(deleteEntry.fulfilled, (s, a) => {
        s.entries = s.entries.filter((e) => e.id !== a.payload)
      })
      .addCase(deleteEntry.rejected, (s, a) => {
        s.error = a.payload ?? 'Błąd usuwania wpisu'
      })
  },
})

export const { setDate } = diarySlice.actions
export default diarySlice.reducer
