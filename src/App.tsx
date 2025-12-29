import React, { useState } from 'react';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const sheetUrl = import.meta.env.VITE_SHEET_URL;
const GOOGLE_MODEL = "gemini-1.5-flash";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

function App() {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleInventoryAdd() {
    if (!prompt) return;
    setLoading(true);
    setStatus('AI is parsing...');

    try {
      // 1. Ask Gemini to turn text into Data
      const aiUrl = `${API_BASE}/models/${GOOGLE_MODEL}:generateContent?key=${apiKey}`;
      const response = await fetch(aiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Extract inventory data from: "${prompt}". Respond ONLY with JSON: {"itemName": "string", "category": "string", "quantity": number, "location": "string"}` }] }]
        })
      });

      const aiData = await response.json();
      const rawText = aiData.candidates[0].content.parts[0].text;
      const jsonStr = rawText.replace(/```json|```/g, "").trim();
      const inventory = JSON.parse(jsonStr);

      // 2. Send to Google Sheets (Fire and Forget)
      setStatus('Saving...');
      const params = new URLSearchParams({
        itemName: inventory.itemName,
        category: inventory.category,
        quantity: inventory.quantity.toString(),
        location: inventory.location
      });

      fetch(`${sheetUrl}?${params.toString()}`, {
        method: 'POST',
        mode: 'no-cors'
      });

      setStatus(`✅ Success: Added ${inventory.itemName}`);
      setPrompt('');

    } catch (err) {
      setStatus('❌ Error: Check your API Key or prompt');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Recallify Inventory</h1>
      <textarea 
        value={prompt} 
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g. Put 2 apples in the fridge"
        style={{ width: '100%', height: '100px' }}
      />
      <br />
      <button onClick={handleInventoryAdd} disabled={loading}>
        {loading ? 'Processing...' : 'Add to Inventory'}
      </button>
      <p>{status}</p>
    </div>
  );
}

export default App;
