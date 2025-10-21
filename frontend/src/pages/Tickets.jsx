import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'

const API = 'http://localhost:5000/api/v1'

export default function Tickets() {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const reduxToken = useSelector(state => state.auth?.user?.token)
  const storedToken = localStorage.getItem('token')
  const token = storedToken || reduxToken

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    let mounted = true
    const load = async () => {
      try {
        const res = await fetch(`${API}/appointments`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) {
          if (res.status === 401) {
            toast.error('Not authorized — please login')
            navigate('/login')
            return
          }
          throw new Error(`Status ${res.status}`)
        }
        const json = await res.json()
        if (mounted) {
          // helpful for debugging shape of appointment objects
          console.log('appointments response sample:', json.data && json.data[0])
          setAppointments(json.data || [])
        }
      } catch (err) {
        if (mounted) setError(err.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
    // eslint-disable-next-line
  }, [token])

  if (loading) return <div style={{ padding: 20 }}>Loading appointments…</div>

  if (!token) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Your Appointments</h2>
        <div>You must <Link to="/login">login</Link> to view your appointments.</div>
      </div>
    )
  }

  if (error) return <div style={{ padding: 20 }}>Error: {error}</div>
  if (!appointments.length) return <div style={{ padding: 20 }}>No appointments found.</div>

  const getField = (obj, camel, alt) => obj?.[camel] ?? obj?.[alt] ?? ''

  // robust parser for date/time/status fields
  const parseDateTime = (app) => {
    // try combined datetime fields first
    const datetimeCandidates = ['datetime', 'dateTime', 'datetimeISO', 'scheduledAt', 'start', 'date', 'Date']
    for (const key of datetimeCandidates) {
      const v = app?.[key]
      if (!v) continue
      const d = new Date(v)
      if (!isNaN(d)) {
        return {
          dateStr: d.toLocaleDateString(),
          timeStr: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      }
    }

    // separate date + time fields
    const dateVal = app?.date ?? app?.Date
    const timeVal = app?.time ?? app?.Time
    let dateStr = '-'
    let timeStr = '-'
    if (dateVal) {
      const d = new Date(dateVal)
      if (!isNaN(d)) dateStr = d.toLocaleDateString()
      else dateStr = String(dateVal)
    }
    if (timeVal) {
      // if time is "HH:MM" or contains colon, use directly; otherwise try parse
      timeStr = String(timeVal)
      if (!timeStr.includes(':')) {
        const tt = new Date(timeStr)
        if (!isNaN(tt)) timeStr = tt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    }

    // fallback: maybe app has an ISO in another nested field
    return { dateStr, timeStr }
  }

  const getStatus = (app) => {
    return app?.status ?? app?.Status ?? app?.state ?? app?.statusText ?? '—'
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Your Appointments</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {appointments.map(app => {
          // massageShop may be populated object or just an id/string
          const shopObj = app.massageShop
          const shopName = typeof shopObj === 'string'
            ? shopObj
            : shopObj?.name ?? shopObj?.Name ?? shopObj?.Address ?? shopObj?._id ?? '—'
          const shopId = typeof shopObj === 'string'
            ? shopObj
            : shopObj?._id ?? shopObj?.id ?? ''

          const { dateStr, timeStr } = parseDateTime(app)
          const status = getStatus(app)

          return (
            <li key={app._id} style={{ border: '1px solid #ddd', padding: 12, marginBottom: 8 }}>
              <div><b>Shop:</b> {shopName}</div>
              <div><b>Date:</b> {dateStr}</div>
              <div><b>Time:</b> {timeStr}</div>
              <div><b>Status:</b> {status}</div>
              <div style={{ marginTop: 8 }}>
                {shopId
                  ? <Link to={`/massageshops/${shopId}`}>View Shop</Link>
                  : <span>View Shop</span>
                }
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
