import { Link } from 'react-router-dom'
import { FaTicketAlt, FaStore } from 'react-icons/fa'
import { useEffect } from 'react'
import { toast } from 'react-toastify'

function Home() {
  useEffect(() => {
    const notifyUpcoming = async () => {
      const token = localStorage.getItem('token')
      if (!token) return

      try {
        const res = await fetch('http://localhost:5000/api/v1/appointments', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) return
        const json = await res.json()
        const appointments = json.data || []

        const msPerDay = 24 * 60 * 60 * 1000
        const today = new Date()
        const notifiedKey = 'notifiedAppointments'
        const notified = JSON.parse(localStorage.getItem(notifiedKey) || '[]')

        appointments.forEach(app => {
          // try common date fields (ISO or plain string)
          const dateStr = app.date || app.Date || app.datetime || app.datetimeISO
          if (!dateStr) return
          const apptDate = new Date(dateStr)
          if (isNaN(apptDate)) return

          const diffDays = Math.ceil((apptDate.setHours(0,0,0,0) - new Date(today).setHours(0,0,0,0)) / msPerDay)
          if (diffDays >= 0 && diffDays <= 5 && !notified.includes(app._id)) {
            toast.info(`Appointment at ${app.massageShop?.name || app.massageShop || 'shop'} in ${diffDays} day(s) on ${apptDate.toLocaleDateString()}`, { autoClose: 8000 })
            notified.push(app._id)
          }
        })

        localStorage.setItem(notifiedKey, JSON.stringify(notified))
      } catch (err) {
        // silent fail — don't spam user
        console.error('Failed to check upcoming appointments', err)
      }
    }

    notifyUpcoming()
  }, [])

  return (
    <>
      <section className='heading'>
        <h1>Massage Q: A Massage Booking System</h1>
        <p>Please choose from an option below</p>
      </section>

      <Link to='/tickets' className='btn btn-block'>
        <FaTicketAlt />View My Appointments
      </Link>
      <Link to='/massageshops' className='btn btn-block'>
        <FaStore />View All Massage Shops
      </Link>
    </>
  )
}
export default Home