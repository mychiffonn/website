---
title: Mini-LLaMA2 PyTorch Implementation
description: Minimal Llama-2 implementation in PyTorch with RoPE, RMSNorm, SwiGLU, self-attention, and transformer blocks.
code: https://github.com/mychiffonn/cmu-advanced-nlp-minllama
fromDate: 2024-05-21
toDate: 2024-05-24
types:
  - coursework
skills:
  - Python
  - PyTorch
  - Model training
selected: true
---

I implemented a minimalist Llama-2 language model from scratch in PyTorch, including self-attention, Rotary Positional Embeddings (RoPE), RMSNorm, SwiGLU activation functions, and core transformer blocks.

I pretrained and evaluated an 8-layer, roughly 42M-parameter model on TinyStories, then tested it on text completion, zero-shot sentiment classification, and task-specific finetuning.
