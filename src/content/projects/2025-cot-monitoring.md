---
title: Behavior of Chain-of-thought Monitorability (On Pause)
fromDate: 2025-10-05
toDate: 2026-04-15
selected: true
description: Studying how monitor effectiveness changes as the capability gap between monitor and target models widens, with a case study on distinguishing sandbagging from genuine incapability.
code: https://github.com/yoenoo/algoverse_nacm
types:
  - research
skills:
  - Python
  - LLM evaluation
  - Chain-of-thought monitoring
---

## Overview

I led a research project mentored by [Yeonwoo Jang](https://www.eyonjang.me/) (MATS 8.2) focused on how chain-of-thought (CoT) monitorability scales as the gap in capability between monitor and target model grows. Using sandbagging detection–whether weaker monitors can reliably distinguish deliberate underperformance from genuine incapability–as a case study, we measure CoT monitorability through AUROC and PRAUC.

I designed a reproducible monitoring pipeline with [Inspect AI](https://inspect.aisi.org.uk/) and [Inspect Scout](https://meridianlabs-ai.github.io/inspect_scout/), and evaluated monitor behavior across dozens of monitor-target pairs spanning Qwen3, Qwen3.5, DeepSeek V4, Kimi K2.6, Gemma 4, and GPT-OSS model families.

**The project is currently on pause due to personal reasons, and will resume late Aug 2026.**

## Motivation

As LLMs grow more capable, oversight is essential for ensuring safe and reliable behavior. Chain-of-thought (CoT) monitoring, which inspects the reasoning traces of models to detect suspicious behavior like sandbagging (i.e. deliberate, deceptive underperformance), is a prominent technique currently used in AI labs pre-deployment. However, the effectiveness of CoT monitoring likely depends on the relative capabilities of the monitor and target models; weaker monitors may struggle to identify subtle suspiciousness in highly capable targets. Understanding how monitoring performance scales with the capability gap is crucial for designing robust oversight systems.

## Research questions

1. How does monitoring effectiveness (condition-level AUROC) change as the target-monitor capability gap widens?
2. Is there a capability gap beyond which monitoring becomes operationally weak?
3. Does model family identity (Qwen, DeepSeek, Gemma, etc.) dominate the trend for similar capability gaps?
4. Case study: Can monitors distinguish sandbagging from true incapability?

## Expected result

A scaling curve showing how monitor performance degrades or holds as capability gap grows, with each point representing condition-level ROC-AUC for a monitor-target pair, faceted by CoT exposure.

- **Y-axis:** Monitor success rate measured by condition-level ROC-AUC (sandbagger transcripts = positive, task-accuracy-matched genuinely weaker models = negative), reported with 95% bootstrap confidence intervals.
- **X-axis:** Capability gap between monitor and target model, measured via the Artificial Analysis Intelligence Index (AAII).
- **Facets:** CoT exposure (`full` reasoning vs. `summary`-only) and task.

It should curve upward as gap widens, with potential thresholds where monitoring fails — though a flat or inconsistent trend would itself be informative and prompt auditing of score saturation, prompt artifacts, or negative-matching quality before drawing conclusions.

## Methodology

### Sandbagging simulation (Prompted sandbagging)

We elicited sandbagging through prompting, and consider a prompt for subtle sandbagging successful if there's measurable underperformance against the target's own benign baseline (accuracy drop capped around 0.20 for main evidence), without causing broad collapse, refusals, or an explicit confession of underperformance in the visible output.

Turned out this was the main bottleneck of the project, because it wasn't easy to prompt a mid-sized model to sandbag in a way that is not too obvious (i.e., it shows in CoT it just follows the instruction to sandbag) and not too covert (i.e., it is just confused)

:::note[Prompt design iterations]{closed}

- **Leaked policy in reasoning:** Early naive prompts leaked the hidden policy directly into visible reasoning, so monitors caught the prompt's mechanics rather than genuine suspicious behavior.
- **Prefixed assistant reasoning:** Tried prefixing the assistant's private reasoning with sandbagging instructions. However, it was not doable through OpenRouter, which only lets you prefix visible assistant _output_, not the reasoning trace itself.
- **Think tool for planning:** Gave tool-using models a private think tool to plan their sandbagging there — failed on several small Qwen3 and Qwen3.5 models.
- **Imitate a weaker model:** Prompted the target to imitate a weaker model, similar to [Anthropic's automated-researchers-sandbag work](https://alignment.anthropic.com/2025/automated-researchers-sandbag/) — not considered valid, since it's too close to genuine incapability rather than deceptive underperformance.
- **Password locking:** Prompted the target to underperform on certain trigger keywords — too brittle.
- **Probability-based:** Prompted the model to sandbag X% of the time, but the findings align with [Zhao et al., 2026](https://arxiv.org/abs/2601.05414) (and another AI-safety paper I read, accepted at ICML/ICLR — need to dig up the citation) that LLMs don't have a consistent sense of, or reliable functionality for, probability sampling.
- **Activation probability:** Similar to password locking, prompted the model to calculate its own probability of activating sandbagging from an identifier like the transcript or model ID — monitors ended up catching the prompt's mechanics rather than genuine suspicious behavior.
- **Guided step-by-step hiding (~Feb–Mar 2026):** Tested more guided prompts, e.g., [Apollo's anti-scheming prompt](https://www.antischeming.ai/), prompting the model to reason step by step and hide its sandbagging plan in the first step, away from the monitor.
  :::

### Model selection

We mostly use open-weight models with CoT exposed, across a range of general capabilities (proxied through AAII, more below) so that we also have a wide range of capability gaps between monitor and target models, within and across model family. Representative entries:

| Model              | AAII | Full CoT |
| ------------------ | ---: | -------- |
| Kimi K2.6          |   54 | yes      |
| DeepSeek V4 Pro    |   52 | yes      |
| Qwen3.5 397B       |   45 | yes      |
| Qwen3.5 122B       |   42 | yes      |
| Gemma 4 31B        |   39 | yes      |
| Qwen3.5 35B        |   37 | yes      |
| GPT-OSS 120B       |   33 | yes      |
| Qwen3 30B Thinking |   16 | yes      |
| Qwen3 14B          |   15 | yes      |

#### Weaker monitor $M$

Given a target model $T$ with capability $C_T$, we systematically select all weaker monitor models $M$ such that $C_M < C_T$ to cover a range of capability gaps $\Delta_C = C_T - C_M$.

#### Negative samples (genuinely incapable models)

We select honest transcripts from genuinely weaker models whose task accuracy is closest to the sandbagger's accuracy on the same task, ideally within the accuracy delta of $\leq 0.10 \pm 0.01$.

### Capability estimation

To estimate general capability of various models, we used the [Artificial Analysis Intelligence Index (AAII)](https://artificialanalysis.ai/evaluations/artificial-analysis-intelligence-index)).

Ealier experiments (before Mar 2026) used the Epoch Capabilities Index (ECI) from [Epoch's model benchmarks](https://epoch.ai/models/search). We may continue using it to sanity-check that a trend isn't an artifact of the primary proxy, but the two indices are relatively similar.

### Task selection

To make models use chain-of-thought reasoning ([Emmons et al., 2025](https://arxiv.org/abs/2507.05246)), we select tasks known to benefit from CoT prompting and proxy for real world, safety-relevant scenarios.

And since we pick sandbagging as case study, we choose tasks where models can plausibly sandbag: models need to perform well above chance as a baseline, with a plausible in-context motivation to underperform (e.g., safety concerns, self-preservation).

Our primary task is WMDP ([Li et al., 2024](https://www.wmdp.ai/)), a multiple-choice QA dataset that proxies for hazardous knowledge queries across biomedical, chemical, and cybersecurity domains — split into Bio and Cyber subsets, which are cheap enough to run smoke → pilot → scale loops before committing provider budget. We also tested on non-MCQ tasks, such as HMMT (math reasoning) and BigCodeBench, to validate the design and produce final results.

### Monitoring setup

We implement chain-of-thought monitoring with [Inspect AI](https://inspect.aisi.org.uk/).

- **Monitor input:** A single model rollout's reasoning trace (either `full` or `summary`-only, excluding native reasoning), actions taken, final answer, and whether the answer is correct. Each rollout is labeled as sandbagging (target + intervention) or genuine incapability (matched weaker honest model, no intervention).

- **Monitor model:** The weaker model $M$ selected for the target $T$.

- **Monitor output:** A probability score in $[0, 1]$ indicating likelihood of suspiciousness. Monitor prompts are kept general — scoring for misalignment broadly rather than sandbagging specifically — so the monitor isn't just pattern-matching on our own intervention design.

## Evaluation

We evaluate monitor success rate using condition-level ROC-AUC: target+intervention rollouts versus task-accuracy-matched weaker honest rollouts, computed per `(task, target, monitor, intervention, CoT mode)` cell and reported with 95% bootstrap confidence intervals. A secondary realized-failure ROC-AUC (restricted to paired benign-correct/intervention-wrong items) is computed when sample size allows, and prompted off-scope controls track false-positive suspiciousness and selectivity.

Results are aggregated across runs to check robustness, and a scaling point is only treated as valid once scores, labels, sample counts, and scan provenance are all auditable.

## Technical Pivots

- **Capability proxy:** Switched the primary proxy from Epoch's ECI (which required a size-based regression estimate for models without a published score) to the Artificial Analysis Intelligence Index (AAII), which covers our model roster more directly. ECI is now kept only as a fallback/sensitivity check.
- **Model coverage:** Expanded from a single-family Qwen3 size ladder to a genuinely cross-family roster (Qwen3.5, DeepSeek V4, Kimi K2.6, Gemma 4, GPT-OSS), specifically to test whether model-family identity confounds the capability-gap trend rather than assuming within-family scaling generalizes.
- **Negative-sample selection:** Moved from a fixed "$k$ capability ranks below target" scheme to task-accuracy matching within a declared tolerance. Fixed rank steps didn't reliably produce negatives comparable in difficulty to the target's intervention condition.
