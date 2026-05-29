import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

// ─── Spinner ──────────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }) {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }[size]
  return (
    <div className={`${s} border-2 border-teal-500 border-t-transparent rounded-full animate-spin`} />
  )
}

// ─── PageLoader ───────────────────────────────────────────────────────────
export function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-64">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-slate-400 text-sm">Loading data...</p>
      </div>
    </div>
  )
}

// ─── StatCard ─────────────────────────────────────────────────────────────
export function StatCard({ icon: Icon, label, value, sub, trend, color = 'teal' }) {
  const colors = {
    teal:   'bg-teal-500/10 text-teal-400',
    amber:  'bg-amber-500/10 text-amber-400',
    red:    'bg-red-500/10 text-red-400',
    blue:   'bg-blue-500/10 text-blue-400',
    purple: 'bg-purple-500/10 text-purple-400',
  }
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus
  const trendColor = trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : 'text-slate-500'

  return (
    <div className="card flex items-start gap-4">
      <div className={`p-3 rounded-xl ${colors[color] || colors.teal}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-400 text-sm mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-50 truncate">{value}</p>
        {(sub || trend !== undefined) && (
          <div className="flex items-center gap-2 mt-1">
            {sub && <span className="text-slate-500 text-xs">{sub}</span>}
            {trend !== undefined && (
              <span className={`flex items-center gap-0.5 text-xs font-medium ${trendColor}`}>
                <TrendIcon className="w-3 h-3" />
                {Math.abs(trend)}%
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────
export function RiskBadge({ level }) {
  const map = {
    high:   'badge-high',
    medium: 'badge-medium',
    low:    'badge-low',
  }
  return <span className={map[level] || 'badge-info'}>{level?.toUpperCase()}</span>
}

export function RoleBadge({ role }) {
  const map = {
    admin:    'badge-info',
    lecturer: 'badge-medium',
    student:  'badge-low',
  }
  return <span className={map[role] || 'badge-info'}>{role}</span>
}

// ─── EmptyState ───────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="p-4 bg-slate-800 rounded-full mb-4">
          <Icon className="w-8 h-8 text-slate-500" />
        </div>
      )}
      <p className="text-slate-300 font-medium mb-1">{title}</p>
      {description && <p className="text-slate-500 text-sm max-w-xs">{description}</p>}
    </div>
  )
}

// ─── Error Alert ──────────────────────────────────────────────────────────
export function ErrorAlert({ message }) {
  return (
    <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 text-sm">
      <strong>Error:</strong> {message}
    </div>
  )
}

// ─── SectionHeader ────────────────────────────────────────────────────────
export function SectionHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">{title}</h1>
        {description && <p className="text-slate-400 mt-1 text-sm">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
