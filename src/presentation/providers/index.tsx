'use client'

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from 'react'
import { format } from 'date-fns'

// ─── State Shape ────────────────────────────────────────────────────────────
interface AppState {
  /** Selected month in YYYY-MM format */
  selectedMonth: string
  /** Whether the "New Transaction" modal is open */
  isNewTransactionOpen: boolean
  /** Whether the mobile sidebar drawer is open */
  isSidebarOpen: boolean
}

const defaultMonth = format(new Date(), 'yyyy-MM')

const initialState: AppState = {
  selectedMonth: defaultMonth,
  isNewTransactionOpen: false,
  isSidebarOpen: false,
}

// ─── Actions ────────────────────────────────────────────────────────────────
type AppAction =
  | { type: 'SET_MONTH'; payload: string }
  | { type: 'OPEN_NEW_TRANSACTION' }
  | { type: 'CLOSE_NEW_TRANSACTION' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'CLOSE_SIDEBAR' }

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_MONTH':
      return { ...state, selectedMonth: action.payload }
    case 'OPEN_NEW_TRANSACTION':
      return { ...state, isNewTransactionOpen: true }
    case 'CLOSE_NEW_TRANSACTION':
      return { ...state, isNewTransactionOpen: false }
    case 'TOGGLE_SIDEBAR':
      return { ...state, isSidebarOpen: !state.isSidebarOpen }
    case 'CLOSE_SIDEBAR':
      return { ...state, isSidebarOpen: false }
    default:
      return state
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────
interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

const AppContext = createContext<AppContextValue | null>(null)

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useAppState() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppState must be used inside <Providers>')
  return ctx
}

import { ToastProvider } from '@/presentation/components/ui/toast'

// ─── Provider ────────────────────────────────────────────────────────────────

export function Providers({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AppContext.Provider>
  )
}
