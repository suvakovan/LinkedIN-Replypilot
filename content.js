// Inject ReplyPilot button
function injectReplyPilotButton() {
  // Remove existing button if any
  const existingBtn = document.querySelector('.replypilot-btn');
  if (existingBtn) {
    existingBtn.remove();
  }

  const btn = document.createElement("button");
  btn.innerText = "ReplyPilot";
  btn.className = "replypilot-btn";
  Object.assign(btn.style, {
    position: "fixed",
    bottom: "15px",
    right: "15px",
    background: "#0073b1",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: "25px",
    fontSize: "14px",
    fontWeight: "bold",
    zIndex: 9999,
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  });

  document.body.appendChild(btn);
  console.log("ReplyPilot button injected successfully");

  // Add click handler after button is created
  setTimeout(addButtonClickHandler, 100);
}

// Inject button when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectReplyPilotButton);
} else {
  injectReplyPilotButton();
}

// Add click handler after button is created
function addButtonClickHandler() {
  const btn = document.querySelector('.replypilot-btn');
  if (btn) {
    btn.addEventListener("click", () => {
      const selectedText = window.getSelection().toString().trim();
      if (!selectedText) {
        alert("Please select a comment first.");
        return;
      }
      showReplyWidget(selectedText);
    });
  }
}

function showReplyWidget(text) {
  removeExistingWidget();
  const widget = document.createElement("div");
  widget.className = "replypilot-widget";
  widget.innerHTML = `
    <div class="rp-header">
      <span class="rp-title">✅ LinkedIn AI Assistant</span>
      <button id="closeWidget" class="rp-close">✕</button>
    </div>
    <div class="rp-preview">
      <label>SELECTED TEXT:</label>
      <p>${text.slice(0, 140)}...</p>
    </div>
    <label class="rp-section">CHOOSE TONE:</label>
    <div class="rp-tones">
      <button class="rp-tone" data-tone="Formal">🎩<br>Formal</button>
      <button class="rp-tone" data-tone="Friendly">😊<br>Friendly</button>
      <button class="rp-tone" data-tone="Insightful">💡<br>Insightful</button>
      <button class="rp-tone" data-tone="Funny">😂<br>Funny</button>
      <button class="rp-tone" data-tone="Thanks">🙏<br>Thanks</button>
      <button class="rp-tone" data-tone="Plug">🚀<br>Plug Product</button>
    </div>
    <div class="rp-short-toggle">
      <label class="rp-toggle-label">
        <span>📝 Short Content</span>
        <input type="checkbox" id="shortContentToggle" class="rp-toggle-input">
        <span class="rp-toggle-slider"></span>
      </label>
      <span class="rp-toggle-hint">Generate brief 1-2 sentence reply</span>
    </div>
    <button id="genReply" class="rp-generate">Generate Reply</button>
    <div id="aiReplyOutput" class="rp-output"></div>
  `;
  document.body.appendChild(widget);
  applyReplyPilotStyles();

  document.getElementById("closeWidget").onclick = () => widget.remove();

  let selectedTone = "Friendly";
  document.querySelectorAll(".rp-tone").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".rp-tone").forEach(b => b.classList.remove("rp-active"));
      btn.classList.add("rp-active");
      selectedTone = btn.dataset.tone;
    };
  });
  document.querySelector('.rp-tone[data-tone="Friendly"]').classList.add('rp-active');

  document.getElementById("genReply").onclick = () => {
    const shortContent = document.getElementById("shortContentToggle").checked;
    fetchReplyAndInsert(text, selectedTone, shortContent);
  };
}

function applyReplyPilotStyles() {
  if (document.getElementById('replypilot-style')) return;
  const style = document.createElement("style");
  style.id = 'replypilot-style';
  style.innerHTML = `
.replypilot-widget { position: fixed; bottom: 100px; right: 30px; width: 340px; background: #1d2227; color: white; padding: 18px; border-radius: 16px; font-family: 'Segoe UI', sans-serif; box-shadow: 0 8px 24px rgba(0,0,0,0.2); z-index: 9999; }
.rp-header { display: flex; justify-content: space-between; align-items: center; font-size: 14px; margin-bottom: 10px; }
.rp-close { background: none; color: #ccc; font-size: 16px; border: none; cursor: pointer; }
.rp-preview { background: #2c3138; padding: 10px; font-size: 12px; border-radius: 8px; margin-bottom: 16px; }
.rp-preview label { font-weight: 500; color: #aaa; display: block; margin-bottom: 4px; }
.rp-tones { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 12px 0; }
.rp-tone { background: #2b2f35; border: 1px solid #444; border-radius: 8px; color: white; font-size: 13px; padding: 10px 0; cursor: pointer; text-align: center; }
.rp-tone.rp-active { border-color: #0a66c2; background: #0a66c2; }
.rp-generate { width: 100%; background: #0a66c2; border: none; padding: 10px; font-weight: 600; border-radius: 8px; color: white; font-size: 14px; cursor: pointer; }
.rp-output { margin-top: 14px; font-size: 13px; font-style: italic; color: #ccc; }
.rp-short-toggle { margin: 12px 0; padding: 10px; background: #2b2f35; border-radius: 8px; }
.rp-toggle-label { display: flex; align-items: center; justify-content: space-between; cursor: pointer; position: relative; }
.rp-toggle-label span:first-child { font-size: 13px; color: #fff; }
.rp-toggle-input { opacity: 0; width: 0; height: 0; position: absolute; }
.rp-toggle-slider { width: 44px; height: 22px; background: #444; border-radius: 11px; position: relative; transition: background 0.3s; }
.rp-toggle-slider::before { content: ''; position: absolute; width: 18px; height: 18px; background: white; border-radius: 50%; top: 2px; left: 2px; transition: transform 0.3s; }
.rp-toggle-input:checked + .rp-toggle-slider { background: #0a66c2; }
.rp-toggle-input:checked + .rp-toggle-slider::before { transform: translateX(22px); }
.rp-toggle-hint { display: block; font-size: 11px; color: #888; margin-top: 6px; }
@media (max-width: 500px) { .replypilot-widget { width: 98vw; right: 1vw; left: 1vw; bottom: 10px; padding: 10px; } }
`;
  document.head.appendChild(style);
}

function fetchReplyAndInsert(text, tone, shortContent = false) {
  let prompt;
  if (shortContent) {
    prompt = `You are a professional LinkedIn assistant. Reply to this comment: "${text}" in a ${tone.toLowerCase()} tone. Keep your response very brief - maximum 1-2 short sentences only. Be concise and to the point.`;
  } else {
    prompt = `You are a professional LinkedIn assistant. Reply to this comment: "${text}" in a ${tone.toLowerCase()} tone. Keep it short, kind, and helpful.`;
  }

  const output = document.getElementById("aiReplyOutput");
  output.innerText = "Generating…";
  console.log("Sending message to background:", prompt);

  chrome.runtime.sendMessage(
    { type: "fetch-openai-reply", prompt: prompt },
    function (response) {
      console.log("Received response from background:", response);

      if (chrome.runtime.lastError) {
        console.error("Chrome runtime error:", chrome.runtime.lastError);
        output.innerText = "Error: " + chrome.runtime.lastError.message;
        return;
      }

      if (response && response.error) {
        output.innerText = response.reply || "Error generating reply.";
        return;
      }

      const reply = response?.reply || "No response generated.";
      output.innerText = reply;

      // Try to auto-insert into LinkedIn comment box
      const commentBox = document.querySelector('[aria-label="Add a comment"]') ||
        document.querySelector('[data-placeholder="Add a comment"]') ||
        document.querySelector('div[contenteditable="true"]');

      if (commentBox) {
        commentBox.focus();
        commentBox.innerText = reply;
        commentBox.dispatchEvent(new InputEvent('input', { bubbles: true }));
        console.log("Reply inserted into comment box");
      } else {
        console.log("Comment box not found, reply generated but not inserted");
      }
    }
  );
}

function removeExistingWidget() {
  const old = document.querySelector(".replypilot-widget");
  if (old) old.remove();
}

function fetchReply(text, tone) {
  document.getElementById("aiReplyOutput").innerText = "Generating...";
  chrome.runtime.sendMessage(
    {
      type: 'fetch-openai-reply',
      text,
      tone
    }
  );
}
// 🛑 IMPORTANT: Replace 'YOUR_OPENAI_API_KEY' above with your real OpenAI key from https://platform.openai.com/account/api-keys 