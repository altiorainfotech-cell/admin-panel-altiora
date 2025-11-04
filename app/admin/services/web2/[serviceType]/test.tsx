'use client'

export default function TestPage() {
  return (
    <div style={{ backgroundColor: 'white', color: 'black', padding: '20px', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        Test Page - Can you see this?
      </h1>
      <div style={{ backgroundColor: '#f3f4f6', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>
          Section Header
        </h2>
        <p style={{ color: '#6b7280' }}>
          This is a test section to see if styling works
        </p>
      </div>
      <button 
        style={{ 
          backgroundColor: '#3b82f6', 
          color: 'white', 
          padding: '10px 20px', 
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Test Button
      </button>
    </div>
  )
}