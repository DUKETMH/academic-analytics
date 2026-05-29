import {
  BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts'

const TEAL   = '#14b8a6'
const AMBER  = '#f59e0b'
const RED    = '#ef4444'
const BLUE   = '#3b82f6'
const PURPLE = '#a855f7'
const DEPT_COLORS = [TEAL, BLUE, AMBER, PURPLE, RED]

// ─── Custom Tooltip ───────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="text-slate-300 font-medium mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: <strong>{entry.value}</strong>
        </p>
      ))}
    </div>
  )
}

// ─── CGPA Trend Line Chart ─────────────────────────────────────────────────
export function CGPATrendChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="session" tick={{ fill: '#64748b', fontSize: 11 }} />
        <YAxis domain={[0, 5]} tick={{ fill: '#64748b', fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
        <Line
          type="monotone" dataKey="avg_cgpa" name="Avg CGPA"
          stroke={TEAL} strokeWidth={2.5} dot={{ fill: TEAL, r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone" dataKey="pass_rate" name="Pass Rate %"
          stroke={AMBER} strokeWidth={2} strokeDasharray="5 5"
          dot={{ fill: AMBER, r: 3 }} yAxisId={0}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ─── Department Bar Chart ─────────────────────────────────────────────────
export function DeptCGPAChart({ data = [] }) {
  const shortened = data.map(d => ({
    ...d,
    dept: d.department?.split(' ').map(w => w[0]).join('') ?? d.department,
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={shortened} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="dept" tick={{ fill: '#64748b', fontSize: 11 }} />
        <YAxis domain={[0, 5]} tick={{ fill: '#64748b', fontSize: 11 }} />
        <Tooltip
          content={<CustomTooltip />}
          formatter={(v, n, p) => [v, p.payload.department]}
        />
        <Bar dataKey="avg_cgpa" name="Avg CGPA" radius={[4, 4, 0, 0]}>
          {shortened.map((_, i) => (
            <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── Grade Distribution Pie Chart ─────────────────────────────────────────
const GRADE_COLORS = {
  'A': '#14b8a6', 'B': '#3b82f6', 'C': '#f59e0b',
  'D': '#f97316', 'E': '#ef4444', 'F': '#7f1d1d',
}

export function GradeDistributionChart({ data = [] }) {
  const mapped = data.map(d => ({
    ...d,
    name: d.grade?.split(' ')[0] ?? d.grade,
    fill: GRADE_COLORS[d.grade?.split(' ')[0]] ?? '#64748b',
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={mapped} dataKey="count" nameKey="name"
          cx="50%" cy="50%" outerRadius={90} innerRadius={50}
          paddingAngle={2}
        >
          {mapped.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ─── At-Risk Distribution Bar ─────────────────────────────────────────────
export function AtRiskByDeptChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
        <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
        <YAxis
          type="category" dataKey="department" width={55}
          tick={{ fill: '#64748b', fontSize: 10 }}
          tickFormatter={v => v.split(' ')[0]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
        <Bar dataKey="high_risk_count" name="High Risk" fill={RED}    radius={[0, 4, 4, 0]} />
        <Bar dataKey="total_students"  name="Total"     fill="#1e293b" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
