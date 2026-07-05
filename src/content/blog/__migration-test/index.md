---
title: Migration test parent post
description: Temporary fixture for validating post, subpost, TOC, sidenote, table, and card styles during the Erudite v2 migration.
createdAt: 2026-07-03T09:00:00
image: ./assets/banner.png
tags:
  - migration
  - ui
authors:
  - mychiffon
stage: seedling
audience: Migration reviewers checking responsive blog behavior.
draft: false
---

## Overview

This temporary post exists to stress the blog layout while migrating to Astro Erudite v2. It includes enough prose to test line length, native CSS typography, and table of contents syncing across screen sizes.[^overview]

The parent post should appear as the first item in the post navigation. Subposts should be reachable from the in-page subpost navigation without a full page reload feeling awkward.

## Native CSS Details

The migration should prefer native CSS custom elements, cascade layers, container-aware layout, and Utopia-style spacing and type tokens over Tailwind utility classes.

### Interaction Checklist

- The mobile table of contents opens without layout shift.
- The subpost menu closes after selecting a subpost.
- Sidenotes become margin notes on wide screens and accessible popups on small screens.
- Table content scrolls horizontally only when necessary.

## Data Table

| Surface | Expected behavior | Risk |
| --- | --- | --- |
| TOC | Current heading tracks while scrolling | Medium |
| Subposts | Parent and child links stay smooth | High |
| Cards | Hover and selected states match the deployed site | Medium |

## Callouts

:::note
Callouts render as collapsible elements with an icon, a title, and content.
:::

:::warning[Custom label]
A warning callout with a custom label in brackets.
:::

:::tip{closed}
A tip callout that starts collapsed via the `closed` attribute.
:::

> [!note]
> An Obsidian-syntax callout.

> [!warning]- Collapsed warning
> Starts collapsed via the `-` marker.

> [!tldr] Alias test
> `tldr` should normalize to the abstract variant.

> A plain blockquote should remain a blockquote.

## Closing

The fixture intentionally uses common Markdown features rather than MDX, matching the v2 direction.

[^overview]: A short sidenote that should render beside the text on desktop and remain usable on mobile.
