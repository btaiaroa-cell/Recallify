async function handleInventoryAdd() {
    if (!prompt) return;
    
    setLoading(true);
    setStatus('AI is parsing...');
    
    try {
      // 1. AI Parsing
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

      // 2. The "Fire and Forget" Save
      setStatus('Saving to Sheet...');
      
      const queryParams = new URLSearchParams({
        itemName: inventoryData.itemName,
        category: inventoryData.category,
        quantity: inventoryData.quantity.toString(),
        location: inventoryData.location
      }).toString();

      // We DON'T use 'await' here. This sends data and moves on.
      fetch(`${sheetUrl}?${queryParams}`, {
        method: 'POST',
        mode: 'no-cors' 
      });

      // 3. Immediate UI Update
      setStatus(`✅ Success! Added ${inventoryData.itemName}`);
      setPrompt(''); 

    } catch (err: any) {
      setStatus(`❌ Error: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
