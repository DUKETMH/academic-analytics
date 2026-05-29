import { useState, useEffect, useCallback } from 'react'
import { studentsAPI } from '../services/api'

export function useStudents(initialFilters = {}) {
  const [students, setStudents] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [filters,  setFilters]  = useState(initialFilters)

  const fetch = useCallback(() => {
    setLoading(true)
    setError(null)
    studentsAPI.getAll(filters)
      .then(res  => setStudents(res.data.students || []))
      .catch(err => setError(err.message))
      .finally(()=> setLoading(false))
  }, [JSON.stringify(filters)]) // eslint-disable-line

  useEffect(() => { fetch() }, [fetch])

  return { students, loading, error, setFilters, refetch: fetch }
}

export function useStudent(id) {
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    studentsAPI.getById(id)
      .then(res  => setStudent(res.data.student))
      .catch(err => setError(err.message))
      .finally(()=> setLoading(false))
  }, [id])

  return { student, loading, error }
}
