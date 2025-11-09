import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API = 'http://localhost:5000/api/v1';

function MassageShops() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch(`${API}/massageshops`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const json = await res.json();
        // console.log("load success");
        if (mounted) setShops(json.data || []);
      } catch (err) {
        if (mounted) setError(err.message);
        // console.log("loead failed", err);
      } finally {
        if (mounted) setLoading(false);
        // console.log("load finally");
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div>Loading massage shops…</div>;
  if (error) return <div>Error loading shops: {error}</div>;
  if (!shops.length) return <div>No massage shops found.</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>All Massage Shops</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {shops.map(s => {
          const name = s.name;
          return (
            <li key={s._id} style={{ border: '1px solid #ddd', padding: 12, marginBottom: 8, borderRadius: 4 }}>
              <h3>{name}</h3>
              <div style={{ marginTop: 8 }}>
                <Link to={`/massageshops/${s._id}`}>View details</Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
export default MassageShops;