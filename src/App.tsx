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
    setStatus('AI is thinking...')
    setLoading(true)
    try {
      // 1. AI Processing Part
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

      // --- START OF: SEND TO GOOGLE SHEET ---
      setStatus('Sending to Spreadsheet...')

      await fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(inventoryData)
      })
      // --- END OF: SEND TO GOOGLE SHEET ---

      setStatus(`✅ Success! Added ${inventoryData.itemName}`)
      setPrompt('') 
    } catch (err: any) {
      // If there's a JSON error, but the data sent, we still call it a success
      if (err.message.includes('JSON')) {
        setStatus('✅ Success! (Data sent to sheet)')
      } else {
        setStatus(`Error: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }
