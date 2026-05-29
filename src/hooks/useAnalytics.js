import { useState, useEffect } from 'react'
import { analyticsAPI, predictionsAPI } from '../services/api'

function useFetch(fetchFn, deps = []) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchFn()
      .then(res  => { if (!cancelled) setData(res.data) })
      .catch(err => { if (!cancelled) setError(err.message) })
      .finally(()=> { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error }
}

export function useSummary()           { return useFetch(analyticsAPI.summary) }
export function useByDepartment()      { return useFetch(analyticsAPI.byDepartment) }
export function useTrends()            { return useFetch(analyticsAPI.trends) }
export function useGradeDistribution() { return useFetch(analyticsAPI.gradeDistribution) }
export function useAtRisk()            { return useFetch(predictionsAPI.getAtRisk) }
