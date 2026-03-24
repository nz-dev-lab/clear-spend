/**
 * App.tsx — Root component: routing, providers, splash screen, lazy loading
 *
 * Route structure:
 *   /login      — public
 *   /register   — public
 *   /           — protected → AppLayout
 *     /         → Dashboard
 *     /expenses → Expenses
 *     /budgets  → Budgets
 *     /reports  → Reports
 *     /categories → Categories
 *
 * Lazy loading: every page is loaded on demand (code-split into separate JS
 * chunks) so the initial bundle is small and the app starts fast.
 * While a chunk is downloading, <PageLoader> shows a teal spinner.
 *
 * Splash screen: shown for ~2 seconds on first launch, just like a native app.
 */

import { lazy, Suspense, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { ThemeProvider } from './context/ThemeContext'

import ProtectedRoute from './components/ProtectedRoute'
import AppLayout      from './components/layout/AppLayout'
import SplashScreen   from './components/ui/SplashScreen'
import PageLoader     from './components/ui/PageLoader'

// ── Lazy-loaded pages ──────────────────────────────────────────────────────
// Each page is in its own JS chunk — only downloaded when the user navigates
// to that route for the first time. After that it's cached by the browser.

const Login      = lazy(() => import('./pages/auth/Login'))
const Register   = lazy(() => import('./pages/auth/Register'))
const Dashboard  = lazy(() => import('./pages/Dashboard'))
const Expenses   = lazy(() => import('./pages/Expenses'))
const Budgets    = lazy(() => import('./pages/Budgets'))
const Reports    = lazy(() => import('./pages/Reports'))
const Categories = lazy(() => import('./pages/Categories'))

// ── React Query client ─────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

// ── Page wrapper — adds the slide-up enter animation to every page ──────────
// This is a tiny helper so we don't repeat the className on every route.
function Page({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>
}

export default function App() {
  // splashDone starts as false — the splash screen is shown first.
  // Once SplashScreen calls onDone(), we flip it to true and show the app.
  const [splashDone, setSplashDone] = useState(false)

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            duration: 3500,
            classNames: {
              toast: 'rounded-xl shadow-lg text-sm font-medium',
            },
          }}
        />

        {/* Show splash screen until it finishes, then render the app */}
        {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}

        {/*
          The BrowserRouter is always mounted (not conditionally rendered)
          so history and context are ready before the splash finishes.
          The invisible wrapper means the app is pre-rendered in the background.
        */}
        <div className={splashDone ? '' : 'invisible'}>
          <BrowserRouter>
            {/*
              Suspense wraps all routes so if any lazy chunk is still loading,
              PageLoader is shown instead of a blank screen.
            */}
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public routes */}
                <Route path="/login"    element={<Page><Login /></Page>}    />
                <Route path="/register" element={<Page><Register /></Page>} />

                {/* Protected routes — AppLayout provides the sidebar + header */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route index             element={<Page><Dashboard /></Page>}  />
                    <Route path="expenses"   element={<Page><Expenses /></Page>}   />
                    <Route path="budgets"    element={<Page><Budgets /></Page>}    />
                    <Route path="reports"    element={<Page><Reports /></Page>}    />
                    <Route path="categories" element={<Page><Categories /></Page>} />
                  </Route>
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </div>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
