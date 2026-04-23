---
title: Prescribed Burn stockist page rollout
type: source-note
status: active
updated: 2026-04-23
---

# Prescribed Burn stockist page rollout

Date: 2026-04-23
Client: Prescribed Burn Sauces
Site: https://www.prescribedburnsauces.com/

## What changed

- added a new `/sold-at` page to Prescribed Burn
- added the page to the primary nav
- linked the page from the homepage hero
- added the page to prerender and sitemap coverage

## Why it was added

- the brand has real in-person retail presence that was not visible on the official site
- a stockist page helps the official domain function more clearly as the source of truth for where the brand can be found in person
- this also gives branded and retail-intent searches a cleaner first-party destination than relying only on third-party references

## Source logic used

- recent Square customer history supplied by the client was used as the source list
- co-ops were intentionally excluded by request
- personal-name contacts were intentionally excluded
- pricing and stock counts were intentionally not published

## Guardrails used

- the page treats locations as recent retail spots, not guaranteed live inventory feeds
- each listing links out to a map query rather than claiming exact stock or flavor availability
- the page includes a clear note to call ahead for current stock and flavor availability
- the footer note explicitly says locations and flavor availability may change before a special trip is made

## Outcome

- Prescribed Burn now has a dedicated first-party stockist page that supports retail discovery without overclaiming inventory
- the stockist layer is now crawlable, internal-linked, and included in sitemap coverage
