import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'

const API = 'http://localhost:5000/api/v1'

export default function EditAppointment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const token = localStorage.getItem('token')

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await fetch(`${API}/appointments/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) throw new Error('Failed to load')
        const json = await res.json()
        const app = json.data
        if (mounted) {
          if (app.date) setDate(new Date(app.date).toISOString().slice(0,10))
          if (app.time) setTime(app.time)
        }
      } catch (err) {
        toast.error(err.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id, token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API}/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ date, time })
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.message || 'Update failed')
      }
      toast.success('Updated')
      navigate('/tickets')
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Loading…</div>

  return (
    <div style={{ padding: 20 }}>
      <h2>Edit Appointment</h2>
      <form onSubmit={handleSubmit}>
        <label>Date</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
        <label style={{ display: 'block', marginTop: 8 }}>Time</label>
        <input type="time" value={time} onChange={e => setTime(e.target.value)} required />
        <div style={{ marginTop: 12 }}>
          <button type="submit">Save</button>
          <button type="button" onClick={() => navigate('/tickets')} style={{ marginLeft: 8 }}>Cancel</button>
        </div>
      </form>
    </div>
  )
}