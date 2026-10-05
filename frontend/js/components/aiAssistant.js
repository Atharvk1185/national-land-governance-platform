/**
 * AI Research Assistant Component for NLGIRP.
 * Interactive chat assistant specialized in literature synthesis,
 * research gap identification, policy comparison, and research question formulation.
 */

import { api } from '../api.js';

export async function renderAIAssistant(container) {
  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <div>
        <h1 style="font-size:22px; font-weight:800; color:var(--gov-navy-900); letter-spacing:-0.3px;">
          AI Land Governance Research Assistant
        </h1>
        <p style="font-size:12px; color:var(--gov-slate-500);">
          Evidence extraction, literature synthesis, and gap analysis powered by national research databases.
        </p>
      </div>
      <span class="gov-disclaimer-pill">Evidence Attribution Protocol Active</span>
    </div>

    <!-- Mode Selector Tabs -->
    <div style="display:flex; gap:8px; margin-bottom:14px;" id="assistant-mode-tabs">
      <button class="btn btn-primary active-tab" data-mode="literature_synthesis">
        📚 Literature Synthesis
      </button>
      <button class="btn btn-outline" data-mode="gap_identification">
        🔍 Research Gap Identification
      </button>
      <button class="btn btn-outline" data-mode="policy_comparison">
        ⚖️ Policy & Legal Comparison
      </button>
      <button class="btn btn-outline" data-mode="question_generation">
        💡 Research Question Generator
      </button>
    </div>

    <!-- Interactive Chat Window -->
    <div class="assistant-chat-container">
      <div class="chat-history" id="assistant-chat-history">
        <div class="chat-message assistant">
          <strong>National Research Assistant:</strong><br/>
          Welcome! I am your AI Research Partner trained on peer-reviewed land governance literature, state revenue codes, and national geospatial repositories. 
          Select a research mode above or try one of the inquiries below:
          <div style="margin-top:10px; display:flex; flex-wrap:wrap; gap:6px;">
            <button class="suggestion-chip" style="background:#e2e8f0; color:#1e293b;" data-p="Analyze research on urban land governance and sprawl from 2015-2025.">
              Analyze urban land governance 2015-2025
            </button>
            <button class="suggestion-chip" style="background:#e2e8f0; color:#1e293b;" data-p="What are the unaddressed research gaps regarding the Forest Rights Act implementation?">
              Forest Rights Act research gaps
            </button>
            <button class="suggestion-chip" style="background:#e2e8f0; color:#1e293b;" data-p="Compare presumptive titling under Registration Act 1908 vs conclusive titling under Bhu-Aadhaar.">
              Presumptive vs Conclusive Titling comparison
            </button>
          </div>
        </div>
      </div>

      <!-- Chat Input Box -->
      <div class="chat-input-bar">
        <input type="text" id="assistant-input" placeholder="Type your research inquiry or prompt..." />
        <button class="btn btn-saffron" id="assistant-send-btn">
          Ask Assistant
        </button>
      </div>
    </div>
  `;

  let currentMode = 'literature_synthesis';
  const chatHistory = document.getElementById('assistant-chat-history');
  const inputEl = document.getElementById('assistant-input');
  const sendBtn = document.getElementById('assistant-send-btn');
  const modeTabs = document.querySelectorAll('#assistant-mode-tabs button');

  modeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      modeTabs.forEach(t => {
        t.className = 'btn btn-outline';
      });
      tab.className = 'btn btn-primary';
      currentMode = tab.getAttribute('data-mode');
    });
  });

  async function sendAssistantMessage(promptText) {
    if (!promptText.trim()) return;

    // Append User Message
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-message user';
    userMsg.textContent = promptText;
    chatHistory.appendChild(userMsg);
    inputEl.value = '';
    chatHistory.scrollTop = chatHistory.scrollHeight;

    // Append Loading Skeleton
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'chat-message assistant';
    loadingMsg.innerHTML = '<em>Synthesizing evidence across repository...</em>';
    chatHistory.appendChild(loadingMsg);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    try {
      const res = await api.askAssistant(promptText, currentMode);
      
      const formattedAnswer = res.answer
        .replace(/### (.*?)\n/g, '<h4 style="font-size:13px; font-weight:700; color:var(--gov-navy-900); margin:12px 0 6px 0;">$1</h4>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/- (.*?)\n/g, '<li style="margin-bottom:3px;">$1</li>')
        .replace(/\n\n/g, '<br/><br/>');

      let citationsHtml = '';
      if (res.citations && res.citations.length > 0) {
        citationsHtml = `
          <div style="margin-top:12px; padding-top:8px; border-top:1px solid var(--gov-slate-200); font-size:11px;">
            <strong>Referenced Evidence:</strong><br/>
            ${res.citations.map(c => `• [${c.ref_num}] <em>${c.title}</em> (${c.institution}, ${c.year})`).join('<br/>')}
          </div>
        `;
      }

      loadingMsg.innerHTML = `
        <strong>Research Intelligence Output:</strong><br/>
        ${formattedAnswer}
        ${citationsHtml}
        <div style="font-size:10px; color:var(--gov-slate-500); margin-top:8px;">
          Mode: <strong>${res.task_type}</strong> | Confidence: <strong>${(res.confidence_score * 100).toFixed(0)}%</strong>
        </div>
      `;
      chatHistory.scrollTop = chatHistory.scrollHeight;
    } catch (err) {
      loadingMsg.innerHTML = `<span style="color:var(--gov-danger);">Error querying assistant: ${err.message}</span>`;
    }
  }

  sendBtn.addEventListener('click', () => sendAssistantMessage(inputEl.value));
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendAssistantMessage(inputEl.value);
  });

  document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      sendAssistantMessage(chip.getAttribute('data-p'));
    });
  });
}
