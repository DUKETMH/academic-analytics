import { Users, TrendingUp, AlertTriangle, BookOpen } from 'lucide-react'
import { StatCard, PageLoader, ErrorAlert, SectionHeader } from '../components/ui'
import { CGPATrendChart, DeptCGPAChart, GradeDistributionChart } from '../components/charts'
import {
  useSummary, useByDepartment, useTrends, useGradeDistribution
} from '../hooks/useAnalytics'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const summary  = useSummary()
  const depts    = useByDepartment()
  const trends   = useTrends()
  const grades   = useGradeDistribution()

  if (summary.loading) return <PageLoader />
  if (summary.error)   return <ErrorAlert message={summary.error} />

  const s = summary.data ?? {}

  return (
    <div className="space-y-6">
      <SectionHeader
        title={`Welcome back, ${user?.full_name?.split(' ')[0]} 👋`}
        description={`Academic session ${s.active_session ?? '2023/2024'} overview`}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Students"
          value={s.total_students ?? '—'}
          sub="Across all departments"
          trend={2.3}
          color="teal"
        />
        <StatCard
          icon={TrendingUp}
          label="Average CGPA"
          value={s.avg_cgpa ?? '—'}
          sub="Out of 5.00"
          trend={1.1}
          color="blue"
        />
        <StatCard
          icon={AlertTriangle}
          label="At-Risk Students"
          value={s.at_risk_count ?? '—'}
          sub="Requiring intervention"
          trend={-0.5}
          color="red"
        />
        <StatCard
          icon={BookOpen}
          label="Pass Rate"
          value={s.pass_rate ? `${s.pass_rate}%` : '—'}
          sub="Session pass rate"
          trend={0.8}
          color="amber"
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-200 mb-1">CGPA Trend — 5 Sessions</h3>
          <p className="text-xs text-slate-500 mb-4">Average CGPA and pass rate over time</p>
          {trends.loading
            ? <div className="h-64 flex items-center justify-center"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>
            : <CGPATrendChart data={trends.data ?? []} />
          }
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-slate-200 mb-1">CGPA by Department</h3>
          <p className="text-xs text-slate-500 mb-4">Comparative performance across departments</p>
          {depts.loading
            ? <div className="h-64 flex items-center justify-center"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>
            : <DeptCGPAChart data={depts.data ?? []} />
          }
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-200 mb-1">Grade Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">All grades — current session</p>
          {grades.loading
            ? <div className="h-64 flex items-center justify-center"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>
            : <GradeDistributionChart data={grades.data ?? []} />
          }
        </div>

        {/* Department table */}
        <div className="card lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-200 mb-1">Department Summary</h3>
          <p className="text-xs text-slate-500 mb-4">Students, CGPA and risk per department</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="pb-2 text-xs text-slate-500 font-medium">Department</th>
                  <th className="pb-2 text-xs text-slate-500 font-medium text-right">Students</th>
                  <th className="pb-2 text-xs text-slate-500 font-medium text-right">Avg CGPA</th>
                  <th className="pb-2 text-xs text-slate-500 font-medium text-right">High Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {(depts.data ?? []).map((d, i) => (
                  <tr key={i}>
                    <td className="py-2.5 text-slate-300">{d.department}</td>
                    <td className="py-2.5 text-slate-400 text-right">{d.total_students}</td>
                    <td className="py-2.5 text-right">
                      <span className={`font-medium ${
                        d.avg_cgpa >= 3.5 ? 'text-teal-400'
                        : d.avg_cgpa >= 2.5 ? 'text-amber-400'
                        : 'text-red-400'
                      }`}>
                        {d.avg_cgpa}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <span className={`font-medium ${d.high_risk_count > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {d.high_risk_count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
