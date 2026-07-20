import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabaseClient'

export interface AppUser {
  id: string
  email: string | null
  dailyKcalGoal: number | null
}

interface AuthState {
  user: AppUser | null
  status: 'idle' | 'loading' | 'error'
  error: string | null
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
}

async function fetchProfile(userId: string): Promise<number | null> {
  const { data } = await supabase
    .from('profiles')
    .select('daily_kcal_goal')
    .eq('id', userId)
    .single()
  return data?.daily_kcal_goal ?? null
}

export const register = createAsyncThunk<
  AppUser | null,
  { email: string; password: string },
  { rejectValue: string }
>('auth/register', async ({ email, password }, { rejectWithValue }) => {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return rejectWithValue(error.message)
  if (!data.user) return null // wymagane potwierdzenie email
  return { id: data.user.id, email: data.user.email ?? null, dailyKcalGoal: null }
})

export const login = createAsyncThunk<
  AppUser,
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async ({ email, password }, { rejectWithValue }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) return rejectWithValue(error.message)
  const dailyKcalGoal = await fetchProfile(data.user.id)
  return { id: data.user.id, email: data.user.email ?? null, dailyKcalGoal }
})

export const logout = createAsyncThunk('auth/logout', async () => {
  await supabase.auth.signOut()
})

export const loadSession = createAsyncThunk<AppUser | null>(
  'auth/loadSession',
  async () => {
    const { data } = await supabase.auth.getSession()
    const u = data.session?.user
    if (!u) return null
    const dailyKcalGoal = await fetchProfile(u.id)
    return { id: u.id, email: u.email ?? null, dailyKcalGoal }
  },
)

export const setGoal = createAsyncThunk<
  number,
  { userId: string; goal: number },
  { rejectValue: string }
>('auth/setGoal', async ({ userId, goal }, { rejectWithValue }) => {
  const { error } = await supabase
    .from('profiles')
    .update({ daily_kcal_goal: goal })
    .eq('id', userId)
  if (error) return rejectWithValue(error.message)
  return goal
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (s) => {
        s.status = 'loading'
        s.error = null
      })
      .addCase(login.fulfilled, (s, a) => {
        s.status = 'idle'
        s.user = a.payload
      })
      .addCase(login.rejected, (s, a) => {
        s.status = 'error'
        s.error = a.payload ?? 'Błąd logowania'
      })
      .addCase(register.pending, (s) => {
        s.status = 'loading'
        s.error = null
      })
      .addCase(register.fulfilled, (s, a) => {
        s.status = 'idle'
        s.user = a.payload
      })
      .addCase(register.rejected, (s, a) => {
        s.status = 'error'
        s.error = a.payload ?? 'Błąd rejestracji'
      })
      .addCase(logout.fulfilled, (s) => {
        s.user = null
      })
      .addCase(loadSession.fulfilled, (s, a) => {
        s.user = a.payload
      })
      .addCase(setGoal.fulfilled, (s, a) => {
        if (s.user) s.user.dailyKcalGoal = a.payload
      })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer
