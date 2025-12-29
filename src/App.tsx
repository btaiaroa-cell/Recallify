import React, { useState } from 'react';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const sheetUrl = import.meta.env.VITE_SHEET_URL;

function App() {
  const [status, setStatus] = useState('System Ready');

  async function testAI() {
    setStatus('Testing AI Key...');
    try {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: "Say 'Hello World'" }] }] })
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error.message);
      setStatus('✅ AI is working! Now try adding an item.');
    } catch (err: any) {
      setStatus(`❌ AI Error: ${err.message}`);
    }
  }

  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>Recallify Test Page</h1>
      <div style={{ marginBottom: '20px', padding: '20px', background: '#f0f0f0', borderRadius: '10px' }}>
        <strong>Status:</strong> {status}
      </div>
      <button onClick={testAI} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Step 1: Test AI Connection
      </button>
    </div>
  );
}

export default App;
