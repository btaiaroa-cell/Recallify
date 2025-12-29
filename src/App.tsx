import React, { useState } from 'react';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const sheetUrl = import.meta.env.VITE_SHEET_URL;
const GOOGLE_MODEL = "gemini-1.5-flash";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

function App() {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState('');
  const [debug, setDebug] = useState(''); // New debug state
  const [loading, setLoading] = useState(false);

  async function handleInventoryAdd() {
    if (!prompt) return;
    setLoading(true);
    setStatus('AI is parsing...');
    setDebug('');

    try {
      const aiUrl = `${API_BASE}/models/${GOOGLE_MODEL}:generateContent?key=${apiKey}`;
      const response = await fetch(aiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Extract inventory data from: "${prompt}". Respond ONLY with JSON: {"itemName": "string", "category": "string", "quantity": number, "location": "string"}` }] }]
        })
      });

      // GET THE ACTUAL ERROR MESSAGE FROM GOOGLE
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Google Error ${response.status}`);
      }

      const aiData = await response.json();
      const rawText = aiData.candidates[0].content.parts[0].text;
      const jsonStr = rawText.replace(/```json|```/g, "").trim();
      const inventory = JSON.parse(jsonStr);

      setStatus('Saving to Sheet...');
      const params = new URLSearchParams({
        itemName: inventory.itemName,
        category: inventory.category,
        quantity: inventory.quantity.toString(),
        location: inventory.location
      });

      fetch(`${sheetUrl}?${params.toString()}`, { method: 'GET', mode: 'no-cors' });

      setStatus(`✅ Success: Added ${inventory.itemName}`);
      setPrompt('');

    } catch (err: any) {
      setStatus('❌ Error occurred');
      setDebug(err.message); // This will show us the REAL problem
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '500px', margin: 'auto' }}>
      <h1>Recallify Inventory</h1>
      <textarea 
        value={prompt} 
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g. Put 2 apples in the fridge"
        style={{ width: '100%', height: '80px', marginBottom: '10px' }}
      />
      <button onClick={handleInventoryAdd} disabled={loading} style={{ padding: '10px 20px', cursor: 'pointer' }}>
        {loading ? 'Processing...' : 'Add to Inventory'}
      </button>
      
      <p><strong>Status:</strong> {status}</p>
      
      {debug && (
        <div style={{ marginTop: '20px', padding: '10px', background: '#ffeeee', border: '1px solid red', borderRadius: '5px' }}>
          <p style={{ color: 'red', margin: '0' }}><strong>Technical Detail:</strong></p>
          <code>{debug}</code>
        </div>
      )}
    </div>
  );
}

export default App;
