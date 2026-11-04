# Evaluating RAG

> **One line:** a RAG system has two failure surfaces - **retrieval** and **generation** -
> and you must measure them *separately* or you can't tell which half is broken.

## The two surfaces

| Stage | Question | Metrics |
|-------|----------|---------|
| **Retrieval** | Did we fetch the right context? | recall@k, precision@k, MRR, nDCG, context relevance |
| **Generation** | Given the context, was the answer right? | faithfulness/groundedness, answer relevance, correctness vs. ground truth |

Good answers from bad context = luck. Bad answers from good context = a generation
problem. Only the split tells you where to spend effort.

## Building the eval set

- Start with a **golden set** of real questions + expected answers + the passages that
 should have been retrieved. 50 good examples beat 5,000 synthetic ones.
- Grow it from production traces - every thumbs-down becomes a test case.
- Keep a **regression set** so a prompt/model/chunking change can't silently degrade.

## LLM-as-judge - with guardrails

Judges are useful but biased (verbosity, position, self-preference). Mitigate:
calibrate against human labels on a sample, use pairwise comparison over absolute scores,
and pin the judge model/prompt so scores stay comparable over time.

## Operating it

Wire eval into the pipeline so every change is scored before it ships, and trace
retrieval + generation in production. **Opik** notes live in
[`../llmops`](../llmops) - tracing, eval runs, and regression gates.

## See also

*chunking* · *reranking* · [cross-cutting](../../cross-cutting/README.md) (hallucination, cost, latency) ·
[decisions](../../decisions/README.md) (RAG vs fine-tune vs long-context)
