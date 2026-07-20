import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import productsReducer from './slices/productsSlice'
import diaryReducer from './slices/diarySlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    diary: diaryReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
