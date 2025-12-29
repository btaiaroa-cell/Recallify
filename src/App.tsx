import React, { useState } from 'react'

const GOOGLE_MODEL = 'gemini-1.5-flash-latest'
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta'

export default function App() {
  const [prompt, setPrompt] = useState('I put 5 hammers in the garage')
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY
  const sheetUrl = import.meta.env.VITE_SHEET_URL

  async function handleInventoryAdd() {
    setStatus('AI is processing...')
    setLoading(true)
    try {
      // 1. Tell Gemini to act like a Sortly assistant
      const aiUrl = `${API_BASE}/models/${GOOGLE_MODEL}:generateContent?key=${apiKey}`
      const aiInstruction = `Extract inventory data from this text: "${prompt}". 
      Respond ONLY with a JSON object like this: 
      {"itemName": "string", "category": "string", "quantity": number, "location": "string"}`

      const aiRes = await fetch(aiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: aiInstruction }] }] })
      })

      const aiData = await aiRes.json()
      const rawText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text || ""
      
      // Clean up the AI response to get just the JSON
      const jsonStr = rawText.replace(/```json|```/g, "").trim()
      const inventoryData = JSON.parse(jsonStr)

      // 2. Send that data to your Google Sheet
      setStatus('Saving to Spreadsheet...')
      const sheetRes = await fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors', // Needed for Google Apps Script
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inventoryData)
      })

      setStatus(`✅ Success! Added ${inventoryData.quantity} ${inventoryData.itemName} to ${inventoryData.location}.`)
    } catch (err: any) {
      setStatus(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: 'auto', fontFamily: 'sans-serif' }}>
      <h1>Recallify Sortly-Lite</h1>
      <p>What did you put away?</p>
      <input 
        style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button 
        onClick={handleInventoryAdd} 
        disabled={loading}
        style={{ width: '100%', padding: '12px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
      >
        {loading ? 'Processing...' : 'Add to Inventory'}
      </button>
      
      {status && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '8px' }}>
          {status}
        </div>
      )}
    </div>
  )
}
