import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, ChevronRight, Users } from 'lucide-react'
import { useStudents } from '../hooks/useStudents'
import { PageLoader, ErrorAlert, SectionHeader, EmptyState, RoleBadge } from '../components/ui'

const LEVELS = ['100', '200', '300', '400', '500']
const DEPTS  = [
  'Computer Science', 'Electrical Engineering',
  'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering'
]

function CGPABadge({ cgpa }) {
  const v = parseFloat(cgpa) || 0
  const cls = v >= 3.5 ? 'text-teal-400' : v >= 2.5 ? 'text-amber-400' : v >= 1.0 ? 'text-orange-400' : 'text-red-400'
  return <span className={`font-semibold ${cls}`}>{v.toFixed(2)}</span>
}

export default function Students() {
  const navigate = useNavigate()
  const [search,   setSearch]   = useState('')
  const [dept,     setDept]     = useState('')
  const [level,    setLevel]    = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const { students, loading, error } = useStudents(
    Object.fromEntries(
      Object.entries({ department: dept, level }).filter(([, v]) => v)
    )
  )

  const filtered = useMemo(() => {
    if (!search.trim()) return students
    const q = search.toLowerCase()
    return students.filter(s =>
      s.full_name.toLowerCase().includes(q) ||
      s.matric_number.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    )
  }, [students, search])

  if (loading) return <PageLoader />
  if (error)   return <ErrorAlert message={error} />

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Students"
        description={`${filtered.length} student${filtered.length !== 1 ? 's' : ''} found`}
      />

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, matric number or email..."
            className="input pl-9"
          />
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`btn-secondary flex items-center gap-2 ${showFilters ? 'border-teal-500/50 text-teal-400' : ''}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters {(dept || level) && <span className="bg-teal-500 text-slate-950 text-xs rounded-full px-1.5">●</span>}
        </button>
      </div>

      {/* Filter dropdowns */}
      {showFilters && (
        <div className="card flex flex-wrap gap-4 py-4">
          <div className="flex flex-col gap-1.5 min-w-48">
            <label className="text-xs text-slate-500 font-medium">Department</label>
            <select
              value={dept}
              onChange={e => setDept(e.target.value)}
              className="input text-sm"
            >
              <option value="">All departments</option>
              {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 min-w-32">
            <label className="text-xs text-slate-500 font-medium">Level</label>
            <select
              value={level}
              onChange={e => setLevel(e.target.value)}
              className="input text-sm"
            >
              <option value="">All levels</option>
              {LEVELS.map(l => <option key={l} value={l}>{l}L</option>)}
            </select>
          </div>
          {(dept || level) && (
            <div className="flex items-end">
              <button
                onClick={() => { setDept(''); setLevel('') }}
                className="text-xs text-slate-400 hover:text-red-400 underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students found"
          description="Try adjusting your search or filter criteria."
        />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  {['Matric No.','Full Name','Department','Level','Session','CGPA','Failed',''].map((h, i) => (
                    <th
                      key={i}
                      className={`px-4 py-3 text-xs font-medium text-slate-500 whitespace-nowrap
                        ${i > 4 ? 'text-right' : 'text-left'}`}
                    >
                      {h}
                    </th>
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
                    <td className="px-4 py-3 font-mono text-xs text-slate-400 whitespace-nowrap">
                      {s.matric_number}
                    </td>
                    <td className="px-4 py-3 text-slate-200 font-medium whitespace-nowrap">
                      {s.full_name}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {s.department}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {s.level}L
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {s.session}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <CGPABadge cgpa={s.cgpa} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={s.failed_courses > 0 ? 'text-red-400 font-medium' : 'text-slate-500'}>
                        {s.failed_courses ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      <ChevronRight className="w-4 h-4 inline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-slate-800 text-xs text-slate-500">
            Showing {filtered.length} of {students.length} students
          </div>
        </div>
      )}
    </div>
  )
}
