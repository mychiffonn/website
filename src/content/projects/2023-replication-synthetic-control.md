---
title: "Causal Inference of Political Intervention"
description: Replicated and extended a synthetic control analysis of Philadelphia SNAP benefit redemption in R.
toDate: 2023-12
code: https://github.com/mychiffonn/synthetic-control-rep
doc: https://github.com/mychiffonn/synthetic-control-rep/blob/main/CS130%20Final%20Assignment.pdf
category:
  - research
  - data
tags:
  - R
  - rmarkdown
  - Causal Inference
  - Synthetic Control
  - Replication
---

In a pair, we replicated and extended Chrisinger (2021)'s paper "[Philadelphia's Excise Tax on Sugar-Sweetened and Artificially Sweetened Beverages and Supplemental Nutrition Assistance Program Benefit Redemption](https://ajph.aphapublications.org/doi/full/10.2105/AJPH.2021.306464)" in R.

We analyzed policy impacts across 4 counties and 50+ months of longitudinal data. While we replicated similar trends, the magnitude of the effects differed and our models lacked robustness. We extended the analysis with leave-one-out robustness checks, which revealed donor-pool sensitivity and model instability.
