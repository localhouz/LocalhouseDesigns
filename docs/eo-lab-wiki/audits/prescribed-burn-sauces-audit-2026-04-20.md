---
title: Prescribed Burn Sauces Audit 2026-04-20
type: experiment
status: active
updated: 2026-04-23
confidence: medium
sources:
  - ../wiki/clients/prescribed-burn-sauces.md
  - ../templates/seo-geo-aeo-engagement-template.md
  - ../raw/sources/2026-04-20-prescribed-burn-sauces-search-check.md
  - ../raw/sources/2026-04-21-prescribed-burn-search-console-indexing-and-schema.md
  - ../raw/sources/2026-04-21-prescribed-burn-off-site-entity-scan.md
  - ../raw/sources/2026-04-23-prescribed-burn-stockist-page.md
  - ./prescribed-burn-sauces-measurement-plan-2026-04-21.md
---

# Prescribed Burn Sauces Audit

Date: 2026-04-20
Client: Prescribed Burn Sauces
Industry: Product brand / hot sauce
Geography: product brand with broader search context
Site: https://prescribedburnsauces.com/

## 1. Engagement Goal

Primary objective:
- stronger branded SERP ownership
- stronger product-brand understanding
- stronger answer-engine retrieval for branded product questions

What success would mean:
- the official site clearly owns branded product-brand searches
- third-party listings support the brand instead of overshadowing it
- product and brand facts are easy for search and AI systems to retrieve accurately

## 2. Baseline Snapshot

### Search baseline

Current knowns:
- the brand exists in search
- the official site does not yet clearly dominate the branded result set
- third-party pages and legacy pages still appear prominently
- neutral search checks surfaced retailer, trademark, exhibitor, and legacy-site results around the brand

Known examples previously observed:
- marketplace or retail pages
- trademark pages
- an older Squarespace page

### Page baseline

Important page types:
- homepage
- sauces
- story
- support pages such as `best-used-with` and `meal-guides`

### Off-site baseline

This brand has more external entity noise than the local-service examples.

## 3. Technical Foundation Audit

Current knowns:
- custom product-oriented site exists
- stronger product structure and measurement setup were implemented
- schema support is stronger here than on a typical small product-brand site

Evidence added 2026-04-21:
- `/sauces/`, `/story/`, `/best-used-with/`, and `/meal-guides/` were all confirmed indexed in Search Console
- this lowers confidence in the idea that Prescribed Burn has a broad indexing failure
- the homepage instead surfaced a schema cleanliness issue in the `Organization` markup

Open checks:
- exact homepage inspection status after recrawl
- whether product pages are the ones Google prefers most often
- whether legacy pages should be redirected, canonicalized, or otherwise de-emphasized if still relevant

## 4. Entity Clarity Audit

Strengths:
- official site is stronger than a thin storefront
- product-brand presentation is more deliberate
- multiple important support pages are already indexable enough for Google to keep
- the core brand pages now have a cleaner and more consistent brand-entity and breadcrumb layer

Risk:
- when a product brand has older pages, marketplace pages, and other third-party references, entity control is easier to dilute
- a few on-site references can also blur the story if NorCal Sauce Worx is surfaced too prominently inside Prescribed Burn context instead of being framed as the later manufacturing arm

## 5. Contact Path and Conversion Audit

This site is less about local contact path and more about:
- trust
- product understanding
- purchase confidence
- brand ownership

Priority question:
- does the site clearly function as the brand source of truth

## 6. Content and Topical Authority Audit

Strengths:
- product-brand structure
- richer page support than a minimal ecommerce shell

Gap:
- product brands often need stronger supporting brand narrative and authoritative context if the official domain is competing with retailers and legacy assets

Applied improvement:
- added a dedicated `/sold-at` page so the official site can act as the first-party source for recent in-person retail locations without making live inventory claims
- linked that page from nav, homepage, prerender, and sitemap coverage so it behaves like a real discovery surface rather than a tucked-away note

## 7. Answer-First and AEO / GEO Audit

Strengths:
- stronger product structure should help extractability

Gap:
- answer engines still need the official site to become the clearest and most trusted source among competing references

## 8. Structured Data Audit

Current knowns:
- product-oriented schema and richer structure are part of the current build

Applied improvement:
- removed the problematic review markup from the homepage `Organization` schema instead of building a heavier review layer prematurely
- cleaned one story-page milestone so Prescribed Burn remains the primary brand entity and NorCal is framed as the later manufacturing arm rather than the headline of the milestone
- completed a broader on-site entity pass across the homepage, story, sauces, best-used-with, meal-guides, and gallery pages so Prescribed Burn now uses a more consistent breadcrumb and brand-source schema pattern

Rule:
- keep product facts, brand facts, and any offer data aligned with visible content

## 9. Off-Site Ecosystem Audit

High priority:
- marketplace listings
- trademark pages
- retailer pages
- older brand properties
- brand mentions

Why:
- for this brand, off-site ecosystem control may be one of the most important determinants of whether the official site can own the brand query

Current read:
- Prescribed Burn already has meaningful outside validation from retailers, stockists, event pages, and collaboration pages
- the problem is not absence but uneven quality:
  - some pages reinforce the brand as a real product line
  - some pages reduce it to a retailer or event listing
  - trademark pages and address-style pages can crowd branded search without helping the official site become the clearest source
- some pages also blur Prescribed Burn and NorCal together at the shared address layer
- the new stockist page gives the official domain a cleaner way to absorb some of that retailer intent without publishing inventory or price claims it cannot control

## 10. Prioritization

### Tier 1

- verify branded SERP ownership
- identify exactly which third-party or legacy pages are crowding the brand
- verify that the homepage and key product-support pages stay indexed and strong
- keep the homepage schema lean and trustworthy

### Tier 2

- reinforce the site as the canonical brand source
- expand citation-worthy and answer-ready brand/product support where needed
- clean up legacy confusion if technically possible
- use the measurement plan to watch whether official support pages begin replacing weaker third-party references in branded contexts

### Tier 3

- broader authority and media support
- deeper supporting brand content if the market is competitive enough to justify it
- recurring answer-engine and branded-ownership observation based on the measurement plan

## 11. Executive Summary

Prescribed Burn Sauces still looks like the strongest example of a brand with real entity noise, but the newer evidence changes the diagnosis a bit. The site is not simply failing to get pages indexed. Important support pages are already in Google. The harder problem is that the official site still has to out-clarify and out-own retailers, trademark pages, legacy properties, and other third-party references for the brand name.
