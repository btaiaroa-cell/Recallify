try {
      const aiUrl = `${API_BASE}/models/${GOOGLE_MODEL}:generateContent?key=${apiKey}`;
      const response = await fetch(aiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Extract inventory data from: "${prompt}". Respond ONLY with JSON: {"itemName": "string", "category": "string", "quantity": number, "location": "string"}` }] }]
        })
      });

      // SAFETY CHECK: If the AI fails, this will tell us why
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini AI Error: ${response.status} - ${errorText}`);
      }

      const aiData = await response.json();
      
      // Check if the AI actually returned data
      if (!aiData.candidates || !aiData.candidates[0]) {
        throw new Error("AI returned an empty response. Check your API Key.");
      }

      const rawText = aiData.candidates[0].content.parts[0].text;
      const jsonStr = rawText.replace(/```json|```/g, "").trim();
      const inventory = JSON.parse(jsonStr);

      // ... rest of your code for Google Sheets ...
