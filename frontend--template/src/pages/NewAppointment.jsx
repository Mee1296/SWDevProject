import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux'

const API = 'http://localhost:5000/api/v1';

export default function NewAppointment() {
  const navigate = useNavigate();
  const location = useLocation();
  // preselected shop id passed via state or query (?shop=...)
  const preselectedId = location.state?.shopId || new URLSearchParams(location.search).get('shop');

  const [shops, setShops] = useState([]);
  const [shopId, setShopId] = useState(preselectedId || '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);

  const reduxToken = useSelector(state => state.auth?.user?.token)
  const storedToken = localStorage.getItem('token')
  const token = storedToken || reduxToken

  useEffect(() => {
    let mounted = true;
    async function loadShops() {
      try {
        const res = await fetch(`${API}/massageshops`);
        if (!res.ok) throw new Error('Failed to load shops');
        const json = await res.json();
        if (mounted) setShops(json.data || []);
      } catch (err) {
        toast.error('Cannot load shops: ' + err.message);
      }
    }
    loadShops();
    console.log('NewAppointment token:', token)
    return () => { mounted = false; };
  }, []);

  // If preselected shopId is provided, lock booking to that shop only:
  const selectedShop = shops.find(s => s._id === shopId) || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('You must be logged in to create an appointment.');
      navigate('/login');
      return;
    }
    if (!shopId || !date || !time) {
      toast.error('Please choose a shop, date and time.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/massageshops/${shopId}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ date, time })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || json.error || 'Failed to create appointment');
      toast.success('Appointment created');
      navigate('/tickets'); // go to user's appointments
    } catch (err) {
      toast.error('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // styles for centering the shop detail card
  const centerWrapper = {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 16
  };
  const shopCard = {
    width: '100%',
    maxWidth: 560,
    border: '1px solid #ddd',
    padding: 16,
    borderRadius: 8,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    background: '#fff'
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Create Appointment</h2>

      <form onSubmit={handleSubmit} style={{ maxWidth: 720, margin: '0 auto' }}>
        <label>Massage Shop</label>

        {preselectedId ? (
          // centered locked view when navigated from a specific shop
          <div style={centerWrapper}>
            <div style={shopCard}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>
                {selectedShop?.name ?? selectedShop?.Name ?? shopId}
              </div>
              <div style={{ marginTop: 6 }}>{selectedShop?.address ?? selectedShop?.Address}</div>
              <div style={{ marginTop: 6 }}>{selectedShop?.telephone ?? selectedShop?.Telephone}</div>
              <div style={{ marginTop: 6 }}>
                <b>Open-Close:</b> {selectedShop?.openCloseTime ?? selectedShop?.['Open-Close Time'] ?? ''}
              </div>
              <div style={{ marginTop: 10 }}>
                <Link to={`/massageshops/${shopId}`}>View Shop</Link>
                <Link to="/massageshops" style={{ marginLeft: 12 }}>Back to shops</Link>
              </div>
            </div>
          </div>
        ) : (
          // selectable list when not preselected
          <select value={shopId} onChange={e => setShopId(e.target.value)} required>
            <option value="">-- Select a shop --</option>
            {shops.map(s => (
              <option key={s._id} value={s._id}>
                {s.name ?? s.Name ?? `${s._id}`}
              </option>
            ))}
          </select>
        )}

        <label style={{ display: 'block', marginTop: 12 }}>Date</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />

        <label style={{ display: 'block', marginTop: 12 }}>Time</label>
        <input
          type="time"
          value={time}
          onChange={e => setTime(e.target.value)}
          required
        />

        <div style={{ marginTop: 16 }}>
          <button type="submit" disabled={loading}>
            {loading ? 'Booking…' : 'Book Appointment'}
          </button>
          {!preselectedId && (
            <Link to="/massageshops" style={{ marginLeft: 12 }}>Back to shops</Link>
          )}
        </div>
      </form>
    </div>
  );
}