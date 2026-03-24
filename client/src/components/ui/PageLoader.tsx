/**
 * PageLoader.tsx — Shimmer skeleton screens for lazy-loaded pages
 *
 * Shown via Suspense while a page's JS chunk is downloading.
 * Each skeleton mirrors the real page's card layout so there's no
 * jarring shape-shift when the real content appears.
 *
 * The sweep highlight is driven by the `.shimmer` CSS class in index.css —
 * a gradient that slides left-to-right over a gray base colour.
 *
 * Usage in App.tsx:
 *   <Suspense fallback={<PageLoader />}>
 *     <Routes>…</Routes>
 *   </Suspense>
 *
 * The fallback is route-agnostic (we don't know which page is loading at
 * the Suspense boundary), so we show the most common card shape: the
 * expense-list row with an icon circle, two text lines, and an amount.
 */

// ── Primitive shimmer blocks ────────────────────────────────────────────────

/** A rounded rectangle with the shimmer sweep */
function ShimmerBlock({ className }: { className: string }) {
  return <div className={`shimmer rounded-lg bg-gray-200 dark:bg-gray-700 ${className}`} />
}

/** A circle with the shimmer sweep — used for icon placeholders */
function ShimmerCircle({ className }: { className: string }) {
  return <div className={`shimmer rounded-xl bg-gray-200 dark:bg-gray-700 ${className}`} />
}

// ── Card skeletons ──────────────────────────────────────────────────────────

/**
 * Mimics an expense-list row:
 *   [icon circle]  [title line]           [amount]
 *                  [subtitle line]        [edit] [delete]
 */
function ExpenseRowSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex items-center gap-4">
      <ShimmerCircle className="w-11 h-11 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <ShimmerBlock className="h-4 w-2/3" />
        <ShimmerBlock className="h-3 w-1/3" />
      </div>
      <ShimmerBlock className="h-5 w-16 flex-shrink-0" />
    </div>
  )
}

/**
 * Mimics a stat card on the Dashboard:
 *   [icon]  [label]
 *           [big number]
 */
function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 space-y-3">
      <div className="flex items-center gap-2">
        <ShimmerCircle className="w-9 h-9 flex-shrink-0" />
        <ShimmerBlock className="h-3 w-20" />
      </div>
      <ShimmerBlock className="h-7 w-28" />
      <ShimmerBlock className="h-3 w-16" />
    </div>
  )
}

/**
 * Mimics a budget category card with a progress bar.
 */
function BudgetCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 space-y-4">
      <div className="flex items-center gap-3">
        <ShimmerCircle className="w-11 h-11 flex-shrink-0" />
        <ShimmerBlock className="h-4 w-24" />
      </div>
      <ShimmerBlock className="h-2 w-full rounded-full" />
      <ShimmerBlock className="h-3 w-32" />
    </div>
  )
}

/**
 * Mimics a category icon card (small square).
 */
function CategoryCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex flex-col items-center gap-3">
      <ShimmerCircle className="w-12 h-12" />
      <ShimmerBlock className="h-3 w-16" />
      <ShimmerBlock className="h-2 w-6 rounded-full" />
    </div>
  )
}

// ── Chart placeholder ───────────────────────────────────────────────────────

function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 space-y-3">
      <ShimmerBlock className="h-4 w-32" />
      <div className="shimmer bg-gray-200 dark:bg-gray-700 rounded-xl h-44 w-full" />
    </div>
  )
}

// ── Full page skeletons ─────────────────────────────────────────────────────

/** Dashboard: 4 stat cards + a chart + a list */
function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      <ChartSkeleton />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => <ExpenseRowSkeleton key={i} />)}
      </div>
    </div>
  )
}

/** Expenses: filter bar + list of rows */
function ExpensesSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="shimmer bg-gray-200 dark:bg-gray-700 rounded-xl h-11 w-48" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => <ExpenseRowSkeleton key={i} />)}
      </div>
    </div>
  )
}

/** Budgets: overall banner + grid of category cards */
function BudgetsSkeleton() {
  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 space-y-3">
        <ShimmerBlock className="h-8 w-20" />
        <ShimmerBlock className="h-2 w-full rounded-full" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <BudgetCardSkeleton key={i} />)}
      </div>
    </div>
  )
}

/** Reports: two chart cards */
function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <ShimmerBlock className="h-6 w-36" />
        <ShimmerBlock className="h-9 w-28 rounded-xl" />
      </div>
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
  )
}

/** Categories: grid of icon cards */
function CategoriesSkeleton() {
  return (
    <div className="space-y-4">
      <ShimmerBlock className="h-6 w-40" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => <CategoryCardSkeleton key={i} />)}
      </div>
    </div>
  )
}

// ── Default export ──────────────────────────────────────────────────────────

/**
 * The Suspense fallback doesn't know which page is loading, so we show
 * the Dashboard skeleton as the default — it has the richest layout and
 * looks good as a generic loading state.
 *
 * In practice the spinner only appears the very first time each route is
 * visited (subsequent visits use the cached chunk and skip straight to
 * the pageEnter animation).
 */
export default function PageLoader() {
  return <DashboardSkeleton />
}

// Named exports so individual pages can reuse their own skeleton
// inside their own loading states (e.g. while data is fetching).
export {
  ExpenseRowSkeleton,
  StatCardSkeleton,
  BudgetCardSkeleton,
  CategoryCardSkeleton,
  ChartSkeleton,
  DashboardSkeleton,
  ExpensesSkeleton,
  BudgetsSkeleton,
  ReportsSkeleton,
  CategoriesSkeleton,
}
