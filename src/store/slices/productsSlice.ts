import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabaseClient'

// wartości odżywcze zawsze na 100 g produktu
export interface Product {
  id: string
  name: string
  kcal: number
  protein: number
  fat: number
  carbs: number
  fiber: number | null
  salt: number | null
  created_by: string | null
}

export type NewProduct = Omit<Product, 'id' | 'created_by'>

interface ProductsState {
  items: Product[]
  status: 'idle' | 'loading' | 'error'
  error: string | null
}

const initialState: ProductsState = {
  items: [],
  status: 'idle',
  error: null,
}

export const fetchProducts = createAsyncThunk<Product[]>(
  'products/fetch',
  async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true })
    if (error) throw error
    return (data ?? []) as Product[]
  },
)

export const addProduct = createAsyncThunk<
  Product,
  NewProduct,
  { rejectValue: string }
>('products/add', async (payload, { rejectWithValue }) => {
  const { data, error } = await supabase
    .from('products')
    .insert(payload)
    .select()
    .single()
  if (error) return rejectWithValue(error.message)
  return data as Product
})

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (s) => {
        s.status = 'loading'
      })
      .addCase(fetchProducts.fulfilled, (s, a) => {
        s.status = 'idle'
        s.items = a.payload
      })
      .addCase(fetchProducts.rejected, (s, a) => {
        s.status = 'error'
        s.error = a.error.message ?? 'Błąd pobierania produktów'
      })
      .addCase(addProduct.fulfilled, (s, a) => {
        s.items.push(a.payload)
        s.items.sort((x, y) => x.name.localeCompare(y.name))
      })
      .addCase(addProduct.rejected, (s, a) => {
        s.error = a.payload ?? 'Błąd dodawania produktu'
      })
  },
})

export default productsSlice.reducer
