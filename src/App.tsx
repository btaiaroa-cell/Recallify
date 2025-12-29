import React, { useState } from 'react'

// Updated to the newest 2.0 model to avoid "Not Found" errors
const GOOGLE_MODEL = 'gemini-2.0-flash'
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta'

export default function App() {
  const [prompt, setPrompt] = useState('Give me a friendly 2-line summary of why taking notes helps memory')
  const [response, setResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  // This looks for your Vercel secret key
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY

  async function handleGenerate() {
    setResponse(null)
    setLoading(true)
    try {
      if (!apiKey) throw new Error('API Key missing. Check Vercel Settings!')

      // The standard Google AI Studio URL format
      const url = `${API_BASE}/models/${GOOGLE_MODEL}:generateContent?key=${apiKey}`
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error?.message || `API Error: ${res.status}`)
      }

      // Extract the text answer from Gemini's response structure
      const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received"
      setResponse(aiText)
    } catch (err: any) {
      setResponse(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '700px', margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#2c3e50' }}>Recallify — AI Test</h1>
      <p>Enter a prompt below and click Generate to test the connection.</p>
      
      <textarea 
        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px' }} 
        rows={4} 
        value={prompt} 
        onChange={(e) => setPrompt(e.target.value)} 
      />
      
      <div style={{ marginTop: '12px' }}>
        <button 
          onClick={handleGenerate} 
          disabled={loading} 
          style={{ 
            padding: '10px 24px', 
            backgroundColor: loading ? '#95a5a6' : '#3498db', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? 'Thinking...' : 'Generate Response'}
        </button>
      </div>

      {response && (
        <div style={{ marginTop: '20px', padding: '16px', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #3498db' }}>
          <strong>AI Response:</strong>
          <div style={{ marginTop: '8px', lineHeight: '1.6' }}>{response}</div>
        </div>
      )}
    </div>
  )
}
