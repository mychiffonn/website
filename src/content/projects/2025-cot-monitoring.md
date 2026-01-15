---
title: Scaling Behavior of Chain-of-thought Monitoring
fromDate: 2025-10-05
context: research
isHighlighted: true
description: Studying how monitor effectiveness scales with the capability gap between monitor and target models.
code: https://github.com/yoenoo/algoverse_nacm
tags:
  - Chain of Thought
  - Sandbagging
  - Inspect AI
  - OpenRouter API
  - HuggingFace Inference Providers
---

## Overview

I lead a research project mentored by [Eyon Jang](https://www.eyonjang.me/) (MATS 8 Scholar) focused on how chain-of-thought monitoring scales as the gap between monitor and target model capabilities grows. The core goal is to test whether weaker monitors can reliably separate sandbagging behavior from genuine model incapability.

## Motivation

As LLMs grow more capable, oversight is essential for ensuring safe and reliable behavior. Chain-of-thought (CoT) monitoring, which inspects the reasoning traces of models to detect suspicious behavior like sandbagging (i.e. deliberate, deceptive underperformance), is a prominent technique currently used in AI labs pre-deployment. However, the effectiveness of CoT monitoring likely depends on the relative capabilities of the monitor and target models; weaker monitors may struggle to identify subtle suspiciousness in highly capable targets. Understanding how monitoring performance scales with the capability gap is crucial for designing robust oversight systems.

## Research questions

1. How does monitoring effectiveness change as the monitor-to-model capability ratio widens?
2. Is there a capability ratio below which monitoring fails entirely?
3. Do the same scaling laws hold across model families?
4. Case study: Can monitors distinguish sandbagging from true incapability?

## Expected result

A scaling curve showing how monitor performance degrades or holds as capability gap grows, with each point representing PR-AUC for a monitor-target pair.

- **Y-axis:** Monitor success rate measured by PR-AUC (sandbagger = positive, genuine incapability = negative).
- **X-axis:** Capability gap between monitor and target model.

It should curve downward as gap widens, with potential thresholds where monitoring fails.

## Methodology

### Model selection

For full chain-of-thought monitoring experiments, we select reasoning models with full CoT exposed. To establish scaling trends within a model family first, we focus on Qwen3 models of varying sizes/capabilities available via HuggingFace Inference API and OpenRouter (alternate between them).

- Qwen3-8B
- Qwen3-14B
- Qwen3-30B-A3B-Thinking
- Qwen3-32B
- Qwen3-Next-80B-A3B-Thinking
- Qwen3-235B-A22B-Thinking
- Qwen3-Coder-480B-A35B-Instruct

We plan to expand to other model families (e.g., AllenAI Olmo 3, OpenAI's GPT-OSS) later.

#### Weaker monitor $M$

Given a target model $T$ with capability $C_T$, we systematically select all weaker monitor models $M$ such that $C_M < C_T$ to cover a range of capability gaps $\Delta_C = C_T - C_M$.

#### Incapable target $T'$

Given a target model $T$, we create an incapable version $T'$ by

- restricting its output space OR
- choosing $n$ weaker model(s) with capability $C_T'$ that are $k \geq 1$ levels below $T$ in capability

### Capability estimation

For general capability, we use the Epoch Capabilities Index (ECI) from [Epoch's model benchmarks](https://epoch.ai/models/search).

For models without published ECI, we estimate using

- regression based on model size and known ECI values `ECI = m * log(params) + b`, where `b` accounts for thinking boost
- empirical evaluation on the benchmarks we use (e.g., WMDP, BigCodeBench; see below)

As a start, within-family comparisons **temporarily** use model size as a proxy (e.g., Qwen3-30B-A3B vs Qwen3-80B on WMDP).

### Task selection

To make models use chain-of-thought reasoning ([Emmons et al., 2025](https://arxiv.org/abs/2507.05246)), we select tasks known to benefit from CoT prompting and proxy for real world, safety-relevant scenarios.

And since we pick sandbagging as case study, we choose tasks where models can plausibly sandbag: models (as small as 14B) need to perform at >= 40% task accuracy as a baseline. Furthermore, models should have reasons to sandbag on these tasks (e.g., safety concerns, uncertainty).

We select two main tasks:

- WMDP ([Li et al., 2024](https://www.wmdp.ai/)), a multiple-choice QA dataset which as proxy for hazardous knowledge queries across biomedical, chemical, and cybersecurity domains
- BigCodeBench Full ([Zhuo et al., 2024](https://arxiv.org/abs/2406.15877)), a code generation benchmark

### Sandbagging simulation

We elicit sandbagging behavior via prompts that instruct the target model $T$ to either

- provide incorrect answers with plausible reasoning
- imitate a confused but well-intentioned student

### Monitoring setup

We implement chain-of-thought monitoring following [Inspect AI's framework](https://inspectai.github.io/inspectai/).

- **Monitor input:** The full CoT reasoning trace from a model (either $T$ or $T'$), actions taken, final answer, and whether the answer is correct. Each sample is labeled as sandbagging (if from $T$) or genuine incapability (if from $T'$ without any system prompt).

- **Monitor model:** The weaker model $M$ selected for the target $T$.

- **Monitor output:** A probability score [0.0, 1.0] indicating likelihood of suspiciousness in general.

## Evaluation

We evaluate monitor success rate using precision-recall AUC (PR-AUC) for distinguishing sandbagging from genuine incapability across varying capability gaps $\Delta_C$. We plot PR-AUC (y-axis) against $\Delta_C$ (x-axis) to visualize scaling behavior.

Results will be aggregated over multiple runs with different random seeds to ensure robustness, and confidence intervals will be reported.

Results will come soon!
