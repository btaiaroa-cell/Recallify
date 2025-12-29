import React, { useState } from 'react'

// Modern Gemini API settings
const GOOGLE_MODEL = 'gemini-1.5-flash'
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta'

export default function App() {
  const [prompt, setPrompt] = useState('Give me a friendly 2-line summary of why taking notes helps memory')
  const [response, setResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  // This grabs your Vercel Key
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY

  async function handleGenerate() {
    setResponse(null)
    setLoading(true)
    try {
      if (!apiKey) throw new Error('VITE_GOOGLE_API_KEY is not set in Vercel settings')

      // Modern URL for Gemini 1.5
      const url = `${API_BASE}/models/${GOOGLE_MODEL}:generateContent?key=${apiKey}`
      
      const body = {
        "contents": [{
          "parts": [{ "text": prompt }]
        }]
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`API error: ${res.status} ${text}`)
      }

      const data = await res.json()
      // Extracting text from the modern Gemini response format
      const out = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received"
      setResponse(out)
    } catch (err: any) {
      setResponse(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1>Recallify — AI test</h1>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
        style={{ width: '100%', fontSize: 14 }}
      />
      <div style={{ marginTop: 12 }}>
        <button onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generating…' : 'Generate'}
        </button>
      </div>
      {response && (
        <div style={{ marginTop: 16, whiteSpace: 'pre-wrap', background: '#f6f8fa', padding: 12 }}>
          <strong>Response:</strong>
          <div>{response}</div>
        </div>
      )}
    </div>
  )
}
