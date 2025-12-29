import React, { useState } from 'react';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

function App() {
  const [status, setStatus] = useState('System Ready');

  async function testAI() {
    setStatus('Testing AI Connection...');
    try {
      // Switched from v1beta to v1 for stability
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: [{ parts: [{ text: "Hello" }] }] 
        })
      });
      
      const data = await resp.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      setStatus('✅ SUCCESS! The AI is linked. Now we can build the inventory.');
    } catch (err: any) {
      setStatus(`❌ AI Error: ${err.message}`);
    }
  }

  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>Recallify Connection Test</h1>
      <div style={{ marginBottom: '20px', padding: '20px', background: '#f0f0f0', borderRadius: '10px' }}>
        <strong>Status:</strong> {status}
      </div>
      <button onClick={testAI} style={{ padding: '12px 24px', fontSize: '16px', cursor: 'pointer' }}>
        Click to Test Connection
      </button>
    </div>
  );
}

export default App;
