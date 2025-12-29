async function handleInventoryAdd() {
    if (!prompt) return;
    
    setLoading(true);
    setStatus('AI is parsing...');
    
    try {
      // 1. AI Parsing (Gemini)
      const aiUrl = `${API_BASE}/models/${GOOGLE_MODEL}:generateContent?key=${apiKey}`;
      const aiInstruction = `Extract inventory data from: "${prompt}". Respond ONLY with JSON: {"itemName": "string", "category": "string", "quantity": number, "location": "string"}`;

      const aiRes = await fetch(aiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: aiInstruction }] }] })
      });

      const aiData = await aiRes.json();
      const rawText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const jsonStr = rawText.replace(/```json|```/g, "").trim();
      const inventoryData = JSON.parse(jsonStr);

      // 2. The "Fire and Forget" Save (The Fix)
      setStatus('Saving to Sheet...');
      
      const queryParams = new URLSearchParams({
        itemName: inventoryData.itemName,
        category: inventoryData.category,
        quantity: inventoryData.quantity.toString(),
        location: inventoryData.location
      }).toString();

      // THE MAGIC LINE: No 'await' and 'no-cors' mode.
      // We send the data and keep moving!
      fetch(`${sheetUrl}?${queryParams}`, {
        method: 'POST',
        mode: 'no-cors' 
      });

      // 3. Show Success Instantly
      setStatus(`✅ Success! Added ${inventoryData.itemName}`);
      setPrompt(''); 

    } catch (err: any) {
      // This only triggers if the AI parsing fails
      setStatus(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }
