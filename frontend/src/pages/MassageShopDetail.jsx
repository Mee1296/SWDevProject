import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const API = 'http://localhost:5000/api/v1';

export default function MassageShopDetail() {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch(`${API}/massageshops/${id}`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const json = await res.json();
        if (mounted) setShop(json.data || null);
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div>Loading shop…</div>;
  if (error) return <div>Error: {error}</div>;
  if (!shop) return <div>Shop not found.</div>;
  // console.log("shop", shop.Address, shop.Telephone);
  // helper to handle different key casing
  const getField = (obj, camel, alt) => obj?.[camel] ?? obj?.[alt] ?? '';

  const name = getField(shop, 'name', 'Name');
  const address = getField(shop, 'address', 'Address');
  const telephone = getField(shop, 'telephone', 'Telephone');
  const openCloseTime = getField(shop, 'openCloseTime', 'openCloseTime') || getField(shop, 'openCloseTime', 'Open-Close Time') || getField(shop, 'openCloseTime', 'OpenCloseTime');
  return (
    <div style={{ padding: 20 }}>
      <h2>{shop.name}</h2>
      <div><b>Address:</b> {address}</div>
      <div><b>Telephone:</b> {telephone}</div>
      <div><b>Open-Close:</b> {openCloseTime}</div>
      
      <div style={{ marginTop: 12 }}>
        {/* navigate to NewAppointment and pass the shop id so booking is locked to this shop */}
        <Link to="/new-ticket" state={{ shopId: id }} className="btn">Book appointment for this shop</Link>
        <Link to="/massageshops" style={{ marginLeft: 12 }}>Back to all shops</Link>
      </div>
    </div>
  );
}