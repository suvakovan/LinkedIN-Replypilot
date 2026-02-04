// Load saved API key on popup open
document.addEventListener('DOMContentLoaded', () => {
  const defaultApiKey = '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';

  chrome.storage.sync.get(['groqApiKey'], (result) => {
    const apiKeyInput = document.getElementById('api-key');
    const keyStatus = document.getElementById('key-status');

    console.log('Storage result:', result);

    if (result.groqApiKey) {
      apiKeyInput.value = result.groqApiKey;
      keyStatus.textContent = '✅ API key saved';
      keyStatus.style.color = 'green';
    } else {
      // Set default API key
      apiKeyInput.value = defaultApiKey;
      keyStatus.textContent = '🔑 Default API key loaded';
      keyStatus.style.color = 'blue';

      // Auto-save the default key
      chrome.storage.sync.set({ groqApiKey: defaultApiKey }, () => {
        console.log('API key saved to storage');
        keyStatus.textContent = '✅ API key auto-saved';
        keyStatus.style.color = 'green';
      });
    }
  });
});

// Save API key
document.getElementById('save-key').addEventListener('click', () => {
  const apiKey = document.getElementById('api-key').value.trim();
  if (apiKey && apiKey.startsWith('gsk_')) {
    chrome.storage.sync.set({ groqApiKey: apiKey }, () => {
      document.getElementById('key-status').textContent = '✅ API key saved';
      document.getElementById('key-status').style.color = 'green';
    });
  } else {
    document.getElementById('key-status').textContent = '❌ Invalid API key format (should start with gsk_)';
    document.getElementById('key-status').style.color = 'red';
  }
});

// Test API key functionality
document.getElementById('test-api').addEventListener('click', async () => {
  const statusEl = document.getElementById('popup-status');
  statusEl.textContent = 'Testing API key...';
  statusEl.style.color = 'blue';

  try {
    chrome.storage.sync.get(['groqApiKey'], (result) => {
      const apiKey = result.groqApiKey;

      if (!apiKey) {
        statusEl.textContent = '❌ No API key found. Please save your key first.';
        statusEl.style.color = 'red';
        return;
      }

      // Test API key by calling Groq models endpoint
      fetch("https://api.groq.com/openai/v1/models", {
        headers: {
          "Authorization": `Bearer ${apiKey}`
        }
      })
        .then(res => {
          if (res.ok) {
            statusEl.textContent = '✅ API key is working!';
            statusEl.style.color = 'green';
          } else {
            statusEl.textContent = `❌ API error: ${res.status} ${res.statusText}`;
            statusEl.style.color = 'red';
          }
        })
        .catch(err => {
          statusEl.textContent = `❌ Network error: ${err.message}`;
          statusEl.style.color = 'red';
        });
    });
  } catch (error) {
    statusEl.textContent = `❌ Error: ${error.message}`;
    statusEl.style.color = 'red';
  }
});

// Test extension functionality
document.getElementById('popup-action').addEventListener('click', async () => {
  const statusEl = document.getElementById('popup-status');
  statusEl.textContent = 'Testing...';

  try {
    // Check if we're on LinkedIn
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url.includes('linkedin.com')) {
      statusEl.textContent = '❌ Please go to LinkedIn.com first';
      statusEl.style.color = 'red';
      return;
    }

    // Test if content script is working
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const btn = document.querySelector('.replypilot-btn');
        return btn ? 'Extension button found' : 'Extension button not found';
      },
    }, (results) => {
      const result = results && results[0] && results[0].result;
      if (result === 'Extension button found') {
        statusEl.textContent = '✅ Extension is working!';
        statusEl.style.color = 'green';
      } else {
        statusEl.textContent = '❌ Extension not loaded. Try refreshing LinkedIn.';
        statusEl.style.color = 'red';
      }
    });
  } catch (error) {
    statusEl.textContent = `❌ Error: ${error.message}`;
    statusEl.style.color = 'red';
  }
}); 