/**
 * App.tsx — Root component: sets up routing, global providers, and toast notifications
 *
 * Route structure:
 *   /login      — public (no auth needed)
 *   /register   — public
 *   /           — protected (requires login) → AppLayout wraps all inner pages
 *     /         → Dashboard
 *     /expenses → Expenses
 *     /budgets  → Budgets
 *     /reports  → Reports
 *     /categories → Categories
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { ThemeProvider } from './context/ThemeContext'

import ProtectedRoute from './components/ProtectedRoute'
import AppLayout      from './components/layout/AppLayout'

import Login      from './pages/auth/Login'
import Register   from './pages/auth/Register'
import Dashboard  from './pages/Dashboard'
import Expenses   from './pages/Expenses'
import Budgets    from './pages/Budgets'
import Reports    from './pages/Reports'
import Categories from './pages/Categories'

// React Query client — caches API responses and handles background refetching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't retry failed requests more than once (avoids spamming the API)
      retry: 1,
      // Keep data fresh for 30 seconds before refetching in the background
      staleTime: 30_000,
    },
  },
})

export default function App() {
  return (
    // ThemeProvider must wrap everything so dark/light mode works app-wide
    <ThemeProvider>
      {/*
        QueryClientProvider makes React Query available to every component.
        Sonner's Toaster renders toast notifications — positioned top-right on desktop,
        top-center on mobile for better thumb reachability.
      */}
      <QueryClientProvider client={queryClient}>
        <Toaster
          position="top-right"
          richColors          // enables green/red/yellow colored toasts automatically
          closeButton         // shows an X button on each toast
          toastOptions={{
            duration: 3500,
            classNames: {
              toast: 'rounded-xl shadow-lg text-sm font-medium',
            },
          }}
        />

        <BrowserRouter>
          <Routes>
            {/* Public routes — accessible without being logged in */}
            <Route path="/login"    element={<Login />}    />
            <Route path="/register" element={<Register />} />

            {/* Protected routes — redirect to /login if not authenticated */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route index             element={<Dashboard />}  />
                <Route path="expenses"   element={<Expenses />}   />
                <Route path="budgets"    element={<Budgets />}    />
                <Route path="reports"    element={<Reports />}    />
                <Route path="categories" element={<Categories />} />
              </Route>
            </Route>

            {/* Catch-all — redirect unknown URLs to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
