import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ChevronRight, Brain, Filter } from 'lucide-react'
import { useAtRisk } from '../hooks/useAnalytics'
import { PageLoader, ErrorAlert, SectionHeader, RiskBadge, EmptyState } from '../components/ui'
import { AtRiskByDeptChart } from '../components/charts'

function RiskBar({ score }) {
  const pct = Math.round((score ?? 0) * 100)
  const color = pct >= 65 ? 'bg-red-500' : pct >= 35 ? 'bg-amber-500' : 'bg-emerald-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden min-w-16">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-400 w-8 text-right">{pct}%</span>
    </div>
  )
}

export default function AtRisk() {
  const navigate = useNavigate()
  const { data, loading, error } = useAtRisk()
  const [filter, setFilter] = useState('all') // all | high | medium | low

  const students = data?.at_risk ?? data ?? []

  const filtered = useMemo(() =>
    filter === 'all' ? students : students.filter(s => s.risk_level === filter),
    [students, filter]
  )

  // Dept chart data derived from at-risk list
  const deptData = useMemo(() => {
    const map = {}
    students.forEach(s => {
      if (!map[s.department]) map[s.department] = { department: s.department, high_risk_count: 0, total_students: 0 }
      map[s.department].total_students++
      if (s.risk_level === 'high') map[s.department].high_risk_count++
    })
    return Object.values(map)
  }, [students])

  if (loading) return <PageLoader />
  if (error)   return <ErrorAlert message={error} />

  const highCount   = students.filter(s => s.risk_level === 'high').length
  const mediumCount = students.filter(s => s.risk_level === 'medium').length

  return (
    <div className="space-y-6">
      <SectionHeader
        title="At-Risk Students"
        description="ML-powered risk scores using Random Forest classification"
        action={
          <div className="flex items-center gap-2 text-xs text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-lg">
            <Brain className="w-3.5 h-3.5" />
            Random Forest Model
          </div>
        }
      />

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'High Risk',   count: highCount,           cls: 'border-red-500/30    bg-red-500/10    text-red-400' },
          { label: 'Medium Risk', count: mediumCount,         cls: 'border-amber-500/30  bg-amber-500/10  text-amber-400' },
          { label: 'Total Flagged', count: students.length,   cls: 'border-slate-700     bg-slate-800     text-slate-200' },
        ].map(({ label, count, cls }) => (
          <div key={label} className={`border rounded-xl p-4 text-center ${cls}`}>
            <p className="text-2xl font-black">{count}</p>
            <p className="text-xs mt-0.5 opacity-80">{label}</p>
          </div>
        ))}
      </div>

      {/* Chart + table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-200 mb-1">At-Risk by Department</h3>
          <p className="text-xs text-slate-500 mb-4">High-risk count vs total flagged</p>
          <AtRiskByDeptChart data={deptData} />
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden lg:col-span-2">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 px-4 py-3 border-b border-slate-800">
            <Filter className="w-3.5 h-3.5 text-slate-500 mr-1" />
            {['all','high','medium','low'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors capitalize ${
                  filter === f
                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {f === 'all' ? `All (${students.length})` : f}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={AlertTriangle}
              title="No students in this category"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 border-b border-slate-800">
                    {['Student','Dept','Level','CGPA','Risk Score','Risk Level','Factors',''].map((h, i) => (
                      <th key={i} className={`px-4 py-3 font-medium whitespace-nowrap ${i > 2 ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filtered.map(s => (
                    <tr
                      key={s.id}
                      onClick={() => navigate(`/students/${s.id}`)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="text-slate-200 font-medium whitespace-nowrap">{s.full_name}</p>
                        <p className="text-xs text-slate-500 font-mono">{s.matric_number}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                        {s.department?.split(' ')[0]}
                      </td>
                      <td className="px-4 py-3 text-slate-400">{s.level}L</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-semibold ${
                          s.cgpa >= 3.5 ? 'text-teal-400' : s.cgpa >= 2.0 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {parseFloat(s.cgpa || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 min-w-28">
                        <RiskBar score={s.risk_score} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <RiskBadge level={s.risk_level} />
                      </td>
                      <td className="px-4 py-3 text-right max-w-40">
                        <div className="flex flex-wrap gap-1 justify-end">
                          {(s.key_factors ?? []).slice(0, 2).map((f, i) => (
                            <span key={i} className="text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                              {f}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <ChevronRight className="w-4 h-4" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
