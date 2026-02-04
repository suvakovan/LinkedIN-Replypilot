chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "fetch-openai-reply") {
    console.log("Background script received message:", message);

    // Get API key from storage
    chrome.storage.sync.get(['groqApiKey'], (result) => {
      console.log("Background script storage result:", result);
      const apiKey = result.groqApiKey;

      if (!apiKey) {
        console.log("No API key found in storage");
        sendResponse({
          reply: "Please set your Groq API key in the extension popup first.",
          error: "NO_API_KEY"
        });
        return;
      }

      console.log("API key found, making request to Groq...");

      fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: message.prompt }],
          max_tokens: 150,
          temperature: 0.7
        })
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`API Error: ${res.status} ${res.statusText}`);
          }
          return res.json();
        })
        .then((data) => {
          const reply = data.choices?.[0]?.message?.content?.trim();
          sendResponse({ reply: reply || "No response generated." });
        })
        .catch((err) => {
          console.error("API error:", err);
          sendResponse({
            reply: `Error generating reply: ${err.message}`,
            error: err.message
          });
        });
    });
    return true; // Keeps sendResponse open for async
  }
}); 