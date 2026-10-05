# AI Architecture & RAG Pipeline Specification

## 1. RAG Discovery Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor User as Researcher / Official
    participant UI as NLGIRP Frontend
    participant API as FastAPI REST Gateway
    participant AI as AIService (RAG Coordinator)
    participant Vector as Vector & FTS5 Engine
    participant LLM as LLMProvider (RuleBased / OpenAI / Gemini)
    participant Citation as Citation Verification Filter

    User->>UI: Natural Language Query ("Causes of agricultural conversion in MH")
    UI->>API: POST /api/v1/search/query { query, state }
    API->>AI: semantic_search(query, state)
    AI->>Vector: Vector Cosine Match + FTS5 Keyword Fallback
    Vector-->>AI: Top Ranked Research & Policy Chunks
    AI->>LLM: generate_completion(system_prompt, query, context_docs)
    LLM-->>AI: Synthesized Structured Findings & Recommendations
    AI->>Citation: Verify Every Claim Against Source Text & Compute Scores
    Citation-->>API: Formatted Answer + Traceable Citations Array
    API-->>UI: 200 OK (Answer + Citations + Ranked Cards)
    UI-->>User: Interactive Evidence Card & Citation Badges
```

## 2. LLM Provider Abstraction
The system implements a pluggable `LLMProvider` interface:
```python
class LLMProvider(ABC):
    @abstractmethod
    def generate_completion(self, system_prompt: str, user_prompt: str, context_docs: List[Dict[str, Any]]) -> Dict[str, Any]:
        pass
```
Supported implementations:
1. `RuleBasedEvidenceProvider`: Local deterministic extraction engine guaranteeing **zero hallucinations** by synthesizing strictly from retrieved chunks without requiring external API keys.
2. `OpenAIProvider`: Connects to GPT-4o / GPT-3.5-Turbo via `OPENAI_API_KEY`.
3. `GeminiProvider`: Connects to Gemini 1.5 Pro / Flash via Google AI Studio API.
4. `LocalLLMProvider`: Interfaces with local HuggingFace / ONNX / Ollama models.

## 3. Strict Evidence Attribution & Anti-Hallucination Guardrails
- Generated findings MUST cite the reference index (e.g. `[1]`, `[2]`).
- Source organizations, author institutions, publication year, and document IDs are attached to all output objects.
- All outputs display the prominent disclaimer: *"Demonstration Data — Not Official Government Statistics"*.
