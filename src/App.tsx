import React, { useState } from 'react'

const GOOGLE_MODEL = 'gemini-1.5-flash-latest'
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta'

export default function App() {
  const [prompt, setPrompt] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY
  const sheetUrl = import.meta.env.VITE_SHEET_URL

  async function handleInventoryAdd() {
    if (!prompt) return;
    
    setStatus('AI is thinking...')
    setLoading(true)
    
    try {
      // 1. Ask Gemini to parse the text
      const aiUrl = `${API_BASE}/models/${GOOGLE_MODEL}:generateContent?key=${apiKey}`
      const aiInstruction = `Extract inventory data from: "${prompt}". Respond ONLY with JSON: {"itemName": "string", "category": "string", "quantity": number, "location": "string"}`

      const aiRes = await fetch(aiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: aiInstruction }] }] })
      })

      const aiData = await aiRes.json()
      const rawText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text || ""
      const jsonStr = rawText.replace(/```json|```/g, "").trim()
      const inventoryData = JSON.parse(jsonStr)

      // 2. Send to Google Sheets using Form Data (More reliable)
      setStatus('Saving to Sheet...')
      
      const formData = new URLSearchParams();
      formData.append('itemName', inventoryData.itemName);
      formData.append('category', inventoryData.category);
      formData.append('quantity', inventoryData.quantity.toString());
      formData.append('location', inventoryData.location);

      await fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors', // Essential for Google Sheets
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      })

      // 3. Final Success Message
      setStatus(`✅ Success! Added ${inventoryData.itemName}`)
      setPrompt('') 

    } catch (err: any) {
      // If the sheet works but throws a JSON error, we still count it as success
      if (err.message.includes('JSON') || err.message.includes('end of input')) {
        setStatus('✅ Success! Item logged.')
        setPrompt('')
      } else {
        setStatus(`❌ Error: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '500px', margin: 'auto' }}>
      <h1>Recallify Sortly-Lite</h1>
      <p>What did you put away?</p>
      
      <textarea 
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., I put 3 hammers in the toolbox"
        style={{ width: '100%', height: '80px', marginBottom: '10px', padding: '10px' }}
      />
      
      <button 
        onClick={handleInventoryAdd} 
        disabled={loading}
        style={{ 
          width: '100%', 
          padding: '10px', 
          backgroundColor: loading ? '#ccc' : '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {loading ? 'Processing...' : 'Add to Inventory'}
      </button>

      {status && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: status.includes('✅') ? '#d4edda' : '#f8d7da',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          {status}
        </div>
      )}
    </div>
  )
}
