import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import ShopModal from '../components/ShopModal'

const API = 'http://localhost:5000/api/v1'

export default function Tickets() {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalShop, setModalShop] = useState(null)

  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const isAdmin = user?.role === 'admin'
  console.log(user?.role);
  console.log(isAdmin);

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    let mounted = true
    const load = async () => {
      try {
        const url = `${API}/appointments`
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) {
          if (res.status === 401) { toast.error('Not authorized'); navigate('/login'); return }
          throw new Error(`Status ${res.status}`)
        }
        const json = await res.json()
        // debug: inspect shape of appointment objects
        console.log('appointments response sample:', json.data && json.data[0])
        if (mounted) setAppointments(json.data || [])
      } catch (err) {
        if (mounted) setError(err.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [token, isAdmin, navigate])

  const handleDelete = async (id) => {
    if (!confirm('Delete this appointment?')) return
    try {
      const res = await fetch(`${API}/appointments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Deleted')
      setAppointments(prev => prev.filter(a => a._id !== id))
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Loading appointments…</div>
  if (!token) return <div style={{ padding: 20 }}>You must <Link to="/login">login</Link> to view appointments.</div>
  if (error) return <div style={{ padding: 20 }}>Error: {error}</div>
  if (!appointments.length) return <div style={{ padding: 20 }}>No appointments found.</div>

  // robust parser for datetime and status (include apptDate)
  const parseDateTime = (app) => {
    // try appointment-specific field first
    if (app.apptDate) {
      const d = new Date(app.apptDate)
      if (!isNaN(d)) {
        return { dateStr: d.toLocaleDateString(), timeStr: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      }
    }

    // try single datetime-like fields
    const datetimeKeys = ['datetime', 'dateTime', 'datetimeISO', 'scheduledAt', 'start', 'date', 'Date']
    for (const k of datetimeKeys) {
      if (app[k]) {
        const d = new Date(app[k])
        if (!isNaN(d)) {
          return { dateStr: d.toLocaleDateString(), timeStr: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        }
      }
    }
    // separate fields
    const dateVal = app.date ?? app.Date
    const timeVal = app.time ?? app.Time
    let dateStr = '-'
    let timeStr = '-'
    if (dateVal) {
      const d = new Date(dateVal)
      dateStr = !isNaN(d) ? d.toLocaleDateString() : String(dateVal)
    }
    if (timeVal) {
      timeStr = String(timeVal)
      if (!timeStr.includes(':')) {
        const tt = new Date(timeVal)
        if (!isNaN(tt)) timeStr = tt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    }
    return { dateStr, timeStr }
  }

  const getStatus = (app) => {
    // appointment schema currently doesn't include status — provide sensible default
    return app?.status ?? app?.Status ?? 'booked'
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>{isAdmin ? 'Appointments' : 'Your Appointments'}</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {appointments.map(app => {
          // massageShop may be populated object or just an id/string
          const shopObj = app.massageShop
          const shopName = typeof shopObj === 'string'
            ? shopObj
            : shopObj?.name ?? shopObj?._id ?? '—'

          const { dateStr, timeStr } = parseDateTime(app)
          const status = getStatus(app)

          return (
             <li key={app._id} style={{ border: '1px solid #ddd', padding: 12, marginBottom: 8 }}>
               {isAdmin && app.user && (
                <div><b>User:</b> {app.user.name} ({app.user.email})</div>
               )}
               <div><b>Shop:</b> {shopName}</div>
               <div><b>Date:</b> {dateStr}</div>
               <div><b>Time:</b> {timeStr}</div>
               <div><b>Status:</b> {status}</div>
               <div style={{ marginTop: 8 }}>
                {shopObj
                  ? <button onClick={() => setModalShop(shopObj)}>View Shop</button>
                  : <span>View Shop</span>
                }
                <Link to={`/appointments/${app._id}/edit`} style={{ marginLeft: 12 }}>Edit</Link>
                <button onClick={() => handleDelete(app._id)} style={{ marginLeft: 12 }}>Delete</button>
              </div>
            </li>
          )
        })}
      </ul>
      {/* modal */}
      {modalShop && (
        <ShopModal shop={modalShop} onClose={() => setModalShop(null)} />
      )}
    </div>
  )
}