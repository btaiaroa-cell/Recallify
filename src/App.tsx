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
      // 1. Tell Gemini to parse the data
      const aiUrl = `${API_BASE}/models/${GOOGLE_MODEL}:generateContent?key=${apiKey}`
      const aiInstruction = `Extract inventory data from: "${prompt}". 
      Respond ONLY with a JSON object: {"itemName": "string", "category": "string", "quantity": number, "location": "string"}`

      const aiRes = await fetch(aiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: aiInstruction }] }] })
      })

      const aiData = await aiRes.json()
      if (aiData.error) throw new Error(aiData.error.message)

      const rawText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text || ""
      const jsonStr = rawText.replace(/```json|```/g, "").trim()
      const inventoryData = JSON.parse(jsonStr)

      // 2. Send to Google Sheet with "Safety Catch"
      setStatus('Saving to Spreadsheet...')
      
      const response = await fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors', // This makes it work with Google's security
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(inventoryData)
      })

      // Since 'no-cors' doesn't let us read the response, 
      // we assume it worked if no network error occurred!
      setStatus(`✅ Success! Added ${inventoryData.quantity} ${inventoryData.itemName} to the ${inventoryData.location}.`)
      setPrompt('') // Clear the box for the next item

    } catch (err: any) {
      setStatus(`Error: ${err.message}`)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: 'auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#27ae60' }}>Recallify Inventory</h1>
      <p style={{ color: '#666' }}>Type what you've stored (e.g., "5 blue pens in the top drawer")</p>
      
      <input 
        style={{ width: '100%', padding: '15px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px' }}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      
      <button 
        onClick={handleInventoryAdd} 
        disabled={loading}
        style={{ width: '100%', padding: '15px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        {loading ? 'Adding...' : 'Add to Inventory'}
      </button>
      
      {status && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#f4f4f4', borderRadius: '8px', borderLeft: '5px solid #27ae60' }}>
          {status}
        </div>
      )}
    </div>
  )
}
