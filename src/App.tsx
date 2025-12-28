import React, { useState } from 'react'

// Basic example that demonstrates a simple call to Google's Generative Language REST endpoint
// NOTE: For production, do NOT call the Google API directly from client-side code. Use a server
//       (serverless function or backend) to keep your API key secret. This component is for
//       quick local testing and demonstration only.

const GOOGLE_MODEL = 'models/text-bison-001'
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta2'

export default function App() {
  const [prompt, setPrompt] = useState('Give me a friendly 2-line summary of why taking notes helps memory')
  const [response, setResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY

  async function handleGenerate() {
    setResponse(null)
    setLoading(true)
    try {
      if (!apiKey) throw new Error('VITE_GOOGLE_API_KEY is not set in your environment')

      const url = `${API_BASE}/${GOOGLE_MODEL}:generate?key=${apiKey}`
      const body = {
        "prompt": {
          "text": prompt
        },
        "temperature": 0.2,
        "maxOutputTokens": 256
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`API error: ${res.status} ${text}`)
      }

      const data = await res.json()
      // The response shape may vary; try to extract text from known fields
      const out = data?.candidates?.[0]?.content || data?.output || JSON.stringify(data)
      setResponse(String(out))
    } catch (err: any) {
      setResponse(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <h1>Recallify — AI test</h1>
      <p style={{ maxWidth: 720 }}>
        This is a minimal Vite + React starter that demonstrates a simple Generative AI call.
        Set <code>VITE_GOOGLE_API_KEY</code> in a <code>.env</code> file (or your environment) and click
        Generate. For production, run the API call from a server-side component to keep your key secret.
      </p>

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
