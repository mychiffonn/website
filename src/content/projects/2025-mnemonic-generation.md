---
title: Mnemonic Generation for Vocabulary Learning
description: AI chatbot generating memorable English and Mandarin mnemonics with QLoRA fine-tuning and DPO preference modeling.
fromDate: 2024-10
toDate: 2025-03
code: https://github.com/mychiffonn/mnemonic-gen
types:
  - research
  - tool
skills:
  - Python
  - Fine-tuning
  - PyTorch
---

I designed an AI chatbot that generates diverse, memorable, and linguistically grounded mnemonic devices for learning English and Mandarin Chinese vocabulary.

The project used chain-of-thought distillation from a teacher model, DeepSeek-R1, to instill linguistic reasoning in a Gemma3-1B student model through supervised fine-tuning with QLoRA and `unsloth`.

I also implemented a Direct Preference Optimization (DPO) pipeline with `trl`, using 500 human- and LLM-annotated preference pairs scored on memorability, imageability, and expected retention.
