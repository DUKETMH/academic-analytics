import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, BookOpen, TrendingUp } from 'lucide-react'
import { useStudent } from '../hooks/useStudents'
import { PageLoader, ErrorAlert, RiskBadge } from '../components/ui'

function GradeRow({ g }) {
  const total = (parseFloat(g.ca_score) + parseFloat(g.exam_score)).toFixed(1)
  const gradeColor = {
    A: 'text-teal-400', B: 'text-blue-400', C: 'text-amber-400',
    D: 'text-orange-400', E: 'text-red-400', F: 'text-red-600'
  }[g.letter_grade] ?? 'text-slate-400'

  return (
    <tr className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
      <td className="px-4 py-3 font-mono text-xs text-slate-400">{g.code}</td>
      <td className="px-4 py-3 text-slate-300 text-sm">{g.title}</td>
      <td className="px-4 py-3 text-slate-400 text-right">{g.credits}</td>
      <td className="px-4 py-3 text-slate-400 text-right">{g.ca_score ?? '—'}</td>
      <td className="px-4 py-3 text-slate-400 text-right">{g.exam_score ?? '—'}</td>
      <td className="px-4 py-3 text-right font-medium text-slate-200">{total}</td>
      <td className={`px-4 py-3 text-right font-bold ${gradeColor}`}>{g.letter_grade}</td>
      <td className="px-4 py-3 text-right text-slate-400">{g.grade_point?.toFixed(1)}</td>
    </tr>
  )
}

function CGPALabel({ cgpa }) {
  const v = parseFloat(cgpa) || 0
  if (v >= 4.50) return <span className="text-teal-400">First Class</span>
  if (v >= 3.50) return <span className="text-blue-400">Second Class Upper</span>
  if (v >= 2.40) return <span className="text-amber-400">Second Class Lower</span>
  if (v >= 1.50) return <span className="text-orange-400">Third Class</span>
  if (v >= 1.00) return <span className="text-red-400">Pass</span>
  return <span className="text-red-600">Fail</span>
}

export default function StudentDetail() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const { student, loading, error } = useStudent(id)

  if (loading) return <PageLoader />
  if (error)   return <ErrorAlert message={error} />
  if (!student) return <ErrorAlert message="Student not found" />

  const cgpa = parseFloat(student.cgpa ?? student.grades
    ?.reduce((s, g) => s + (g.grade_point * g.credits), 0) /
    (student.grades?.reduce((s, g) => s + g.credits, 0) || 1)
  ) || 0

  // Group grades by session/semester
  const grouped = (student.grades ?? []).reduce((acc, g) => {
    const key = `${g.session} — Semester ${g.semester}`
    ;(acc[key] ??= []).push(g)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Students
      </button>

      {/* Profile card */}
      <div className="card flex flex-col sm:flex-row gap-6 items-start">
        <div className="w-16 h-16 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex items-center justify-center shrink-0">
          <User className="w-7 h-7 text-teal-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-slate-50">{student.full_name}</h1>
          </div>
          <p className="text-slate-400 text-sm font-mono">{student.matric_number}</p>
          <p className="text-slate-500 text-sm mt-1">{student.email}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            <div>
              <p className="text-xs text-slate-500">Department</p>
              <p className="text-sm text-slate-200 font-medium">{student.department}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Level</p>
              <p className="text-sm text-slate-200 font-medium">{student.level}L</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Session</p>
              <p className="text-sm text-slate-200 font-medium">{student.session}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Gender</p>
              <p className="text-sm text-slate-200 font-medium">{student.gender ?? '—'}</p>
            </div>
          </div>
        </div>

        {/* CGPA summary */}
        <div className="sm:text-right shrink-0">
          <div className="text-4xl font-black text-slate-50">{cgpa.toFixed(2)}</div>
          <div className="text-sm text-slate-400 mt-0.5">CGPA / 5.00</div>
          <div className="mt-1 text-sm font-medium"><CGPALabel cgpa={cgpa} /></div>
          <div className="mt-2">
            {cgpa < 2.4
              ? <span className="badge-high">At Risk</span>
              : cgpa < 3.0
              ? <span className="badge-medium">Borderline</span>
              : <span className="badge-low">Good Standing</span>
            }
          </div>
        </div>
      </div>

      {/* Grades */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-teal-400" />
          <h2 className="font-semibold text-slate-200">Academic Records</h2>
          <span className="ml-auto text-xs text-slate-500">
            {student.grades?.length ?? 0} courses
          </span>
        </div>

        {!student.grades?.length ? (
          <div className="px-6 py-12 text-center text-slate-500 text-sm">No grade records found.</div>
        ) : (
          Object.entries(grouped).map(([period, grds]) => (
            <div key={period}>
              <div className="px-6 py-2.5 bg-slate-800/40 border-b border-t border-slate-800">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{period}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500">
                      {['Code','Course','Credits','CA (30)','Exam (70)','Total','Grade','GP'].map((h, i) => (
                        <th key={i} className={`px-4 py-2 font-medium ${i > 1 ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {grds.map((g, i) => <GradeRow key={i} g={g} />)}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
