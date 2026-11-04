# AI Systems

The architect's job - components, trade-offs, NFRs, teardowns - applied to LLM-powered
systems. Hands-on notes, not rehashed blog posts.

- [`rag/`](./rag) - retrieval-augmented generation: chunking, embeddings, vector stores, hybrid search, reranking, [evaluation](./rag/evaluation.md).
- [`agents/`](./agents) - LangGraph & orchestration: state machines, tool use, memory, multi-agent, human-in-the-loop.
- [`extraction/`](./extraction) - intelligent/structured extraction from unstructured docs: schemas, confidence, validation.
- [`agentic-data/`](./agentic-data) - agentic data intelligence: text-to-SQL, semantic layers, query planning over warehouses.
- [`rules/`](./rules) - natural-language to executable business rules: DSLs, verification, determinism vs. LLM judgment.
- [`llmops/`](./llmops) - Opik & friends: tracing, eval runs, guardrails, cost/latency, prompt management.
- [`patterns/`](./patterns) - AI architecture patterns: RAG variants, agent loops, router, reflection, ReAct, orchestrator-worker.

**Ripples into the rest of the notebook:** AI-native NFRs (eval, hallucination/grounding,
token cost, latency, prompt-injection) live in [`../cross-cutting`](../cross-cutting); the
recurring arguments (RAG vs fine-tune vs long-context, agent vs pipeline, build vs API)
live in [`../decisions`](../decisions).
