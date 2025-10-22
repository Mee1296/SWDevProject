import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function ShopModal({ shop, onClose }) {
  const navigate = useNavigate()
  if (!shop) return null

  const name = shop?.name ?? shop?.Name ?? 'Unknown'
  const address = shop?.address ?? shop?.Address ?? '—'
  const telephone = shop?.telephone ?? shop?.Telephone ?? '—'
  const openClose = shop?.openCloseTime ?? shop?.['Open-Close Time'] ?? '—'
  const id = shop?._id ?? shop?.id ?? ''

  const backdropStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000
  }
  const cardStyle = {
    width: '90%',
    maxWidth: 560,
    background: '#fff',
    padding: 20,
    borderRadius: 8,
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  }

  return (
    <div style={backdropStyle} onClick={onClose}>
      <div style={cardStyle} onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: 0 }}>{name}</h3>

        <div style={{ marginTop: 12 }}>
          <div><b>Address:</b> {address}</div>
          <div><b>Telephone:</b> {telephone}</div>
          <div><b>Open-Close:</b> {openClose}</div>
        </div>

        <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}