# EO Lab Wiki Log

## [2026-04-20] ingest | Karpathy LLM Wiki pattern

Touched:
- `README.md`
- `AGENTS.md`
- `index.md`
- `wiki/overview.md`
- `wiki/patterns.md`
- `wiki/playbooks.md`
- `wiki/queries.md`
- `wiki/experiments.md`
- client pages
- concept pages

Summary:
- Initialized the EO Lab Wiki as a Karpathy-style persistent markdown knowledge base.
- Implemented the three-layer architecture: raw sources, wiki, and schema.
- Added index and log files as required navigation and chronology layers.
- Seeded client pages and concept pages so EO observations can accumulate instead of living in chat history.

## [2026-04-20] query | Why use this instead of scattered notes?

Summary:
- Because EO work compounds slowly and needs durable synthesis, contradiction tracking, and reusable patterns.
- The wiki is meant to replace repeated rediscovery with a maintained artifact.

## [2026-04-20] ingest | three first-pass client audits

Touched:
- `audits/north-styles-audit-2026-04-20.md`
- `audits/norcal-sauce-worx-audit-2026-04-20.md`
- `audits/prescribed-burn-sauces-audit-2026-04-20.md`
- `index.md`

Summary:
- Applied the SEO / GEO / AEO engagement template to all three live client sites.
- Captured what is currently known, what is directionally strong, and where the biggest unanswered questions still are.
- Established a baseline that can be refined with real indexation, query, and Search Console evidence.

## [2026-04-20] ingest | branded search evidence notes

Touched:
- `raw/sources/2026-04-20-north-styles-search-check.md`
- `raw/sources/2026-04-20-norcal-sauce-worx-search-check.md`
- `raw/sources/2026-04-20-prescribed-burn-sauces-search-check.md`
- `index.md`

Summary:
- Captured neutral live-search evidence notes for all three brands.
- Documented the third-party and legacy results currently crowding NorCal Sauce Worx and Prescribed Burn Sauces.
- Confirmed that North Styles still has a branded-ownership problem that is visible even in a basic search pass.

## [2026-04-20] ingest | North Styles Search Console evidence

Touched:
- `raw/sources/2026-04-20-north-styles-search-console-indexing.md`
- `audits/north-styles-audit-2026-04-20.md`
- `index.md`

Summary:
- Added first-party Search Console evidence for North Styles.
- Confirmed that `/contact` had a real redirect-based indexing failure.
- Confirmed that `/services` was in a discovered-not-indexed state rather than the same redirect failure.
- Recorded that the sitemap was resubmitted and indexing was requested after the URL/canonical fix.

## [2026-04-21] ingest | NorCal sitemap resolution and positioning update

Touched:
- `raw/sources/2026-04-21-norcal-search-console-sitemap-and-page-state.md`
- `audits/norcal-sauce-worx-audit-2026-04-20.md`
- `index.md`

Summary:
- Recorded that the NorCal sitemap was publicly fetchable and that the Search Console fetch issue was not caused by a broken live sitemap.
- Recorded that the core NorCal pages returned `200` directly, which distinguishes this site from the redirect issues seen on North Styles.
- Logged the homepage and services positioning changes that were made to clarify NorCal as a Sacramento sauce co-packer and private-label manufacturing partner serving brands nationwide.
- Logged the follow-up services-card refinement that tightened buyer language and moved packaging into a clearer support role.
- Logged the hidden use-case page reframing so those pages reinforce NorCal's service identity more directly and stop sounding like internal campaign notes.
- Logged the quote-page framing update so the form now sets expectations around starting-range pricing, one-sauce scoping, and separately scoped additional flavors without making the entry point feel harsher.
- Logged the follow-up quote-page pricing correction so the public copy now reflects the actual $500 R&D program, $600 pilot batch, and $250 additional-sauce/additional-flavor pricing supplied by the client.
- Logged the About-page trust block addition so the site reinforces NorCal's manufacturing identity and best-fit buyer signals without replacing the original brand story.
- Logged the new NorCal resources layer so the site now has a dedicated `/resources` page plus resource-detail pages for private label, formulation, minimums, pilot batches, and packaging alongside the existing buyer-intent pages.
- Logged the follow-up navigation update so `/resources` is now part of the visible main menu and no longer behaves like a semi-hidden section.
- Logged the follow-up resources-hub redesign so the new section has a featured lead resource, a stronger library layout, and a more brand-consistent visual hierarchy.
- Logged the follow-up resource-detail redesign so the inside pages now match the stronger hub layout and use the correct `Resources` breadcrumb/schema path.
- Logged the follow-up resource-content expansion so the NorCal topical cluster now includes best-fit and quote-readiness pages plus deeper copy across the existing manufacturing resources.
- Logged the NorCal structured-data pass so the core pages now share a cleaner business entity layer, breadcrumb pattern, and page-level JSON-LD baseline.
- Logged the NorCal off-site entity scan and the first recurring measurement plan so the next stage of work is based on live outside-the-site evidence and repeatable checks, not memory.
- Logged a Prescribed Burn brand-clarity fix on the story page where a milestone was reframed so Prescribed Burn stays the primary entity and NorCal reads as the later manufacturing arm.
- Logged the broader Prescribed Burn on-site entity pass so the core brand pages now share a cleaner breadcrumb and brand-source schema pattern, and verified the build after the changes.
- Logged the Prescribed Burn off-site entity scan and the first recurring measurement plan so branded ownership can now be tracked against retailers, trademark pages, and other third-party references over time.

## [2026-04-21] ingest | Prescribed Burn indexing clarification and schema cleanup

Touched:
- `raw/sources/2026-04-21-prescribed-burn-search-console-indexing-and-schema.md`
- `audits/prescribed-burn-sauces-audit-2026-04-20.md`
- `index.md`

Summary:
- Recorded first-party Search Console evidence showing that several important Prescribed Burn pages are already indexed.
- Reframed the issue from broad indexing failure to brand/entity competition plus page prioritization.
- Logged the homepage schema cleanup that removed the problematic review markup from the `Organization` structured data.

## [2026-04-22] ingest | Localhouse insight expansion from recent entity and indexing work

Touched:
- `src/app/pages/branded-serp-article/branded-serp-article.ts`
- `src/app/pages/branded-serp-article/branded-serp-article.html`
- `src/app/pages/branded-serp-article/branded-serp-article.scss`
- `src/app/pages/indexing-article/indexing-article.ts`
- `src/app/pages/indexing-article/indexing-article.html`
- `src/app/pages/indexing-article/indexing-article.scss`
- `src/app/app.routes.ts`
- `src/app/app.routes.server.ts`
- `src/app/pages/insights/insights.ts`
- `src/app/pages/home/home.ts`
- `public/sitemap.xml`

Summary:
- Added a new Localhouse article on branded search ownership to capture the recent entity-first lesson from North Styles, NorCal Sauce Worx, and Prescribed Burn Sauces.
- Added a new Localhouse article on indexing friction to capture the recent lesson that discovered or crawled pages still need clearer priority, distinct value, and cleaner signals before Google will reliably index them.
- Wired both articles into routes, prerender, Insights listings, home-page insight previews, and sitemap coverage so they behave like first-class content instead of isolated URLs.
- Backfilled missing sitemap and prerender coverage for a couple of existing article routes so the broader Insights section is better aligned with how the site is actually being used as an EO publishing surface.

## [2026-04-22] ingest | Localhouse self-audit and measurement baseline

Touched:
- `raw/sources/2026-04-22-localhouse-designs-branded-search-check.md`
- `audits/localhouse-designs-audit-2026-04-22.md`
- `audits/localhouse-designs-measurement-plan-2026-04-22.md`
- `wiki/clients/localhouse-designs.md`
- `index.md`

Summary:
- Added the first formal Localhouse branded-search baseline note so the studio is being measured under the same EO discipline it presents to clients.
- Added a Localhouse audit documenting the current split between a decent on-site content foundation and weak branded ownership / off-site entity reinforcement.
- Added a Localhouse-specific measurement plan so homepage, insight-cluster, branded-query, and answer-engine progress can be tracked over time instead of discussed loosely.
- Added a Localhouse client page to the wiki so the studio now sits alongside NorCal, Prescribed Burn, and North Styles as an audited EO surface rather than an unscored exception.

## [2026-04-22] lint | Localhouse re-audit after live-site revisit

Touched:
- `raw/sources/2026-04-22-localhouse-designs-branded-search-check.md`
- `audits/localhouse-designs-audit-2026-04-22.md`
- `wiki/clients/localhouse-designs.md`

Summary:
- Corrected the stale Localhouse assumption that the live homepage was still broader than the newer Oklahoma-service-business positioning.
- Reframed the Localhouse audit so the main remaining blocker is off-site corroboration, branded ownership, and missing first-party Search Console evidence rather than homepage direction drift.
- Tightened the Localhouse client page so the open questions now reflect the current live site more honestly.

## [2026-04-22] ingest | Localhouse audit update for client-site attribution backlinks

Touched:
- `raw/sources/2026-04-22-localhouse-designs-branded-search-check.md`
- `audits/localhouse-designs-audit-2026-04-22.md`
- `wiki/clients/localhouse-designs.md`

Summary:
- Updated the Localhouse EO record to account for linked `Site by Localhouse Designs` attribution on live client sites.
- Reframed off-site support as thin but meaningful rather than treating the brand as supported only by self-controlled profiles.
- Kept the broader conclusion the same: the backlinks help, but they are not yet enough on their own to clean up branded ownership.

## [2026-04-22] ingest | Localhouse non-Search-Console checklist

Touched:
- `audits/localhouse-designs-non-search-console-checklist-2026-04-22.md`
- `wiki/clients/localhouse-designs.md`
- `index.md`

Summary:
- Added a Localhouse-specific checklist for the brand-building work that does not depend on Search Console.
- Captured the immediate non-SC priorities: controllable profiles, client-site attribution consistency, proof-layer reinforcement, authorship consistency, cluster reinforcement, and the GBP/local-presence decision.
- Linked the checklist back into the Localhouse client page so it can act as an active execution list rather than a loose idea.

## [2026-04-23] ingest | Localhouse work-page proof layer upgrade

Touched:
- `src/app/pages/work/work.ts`
- `src/app/pages/work/work.html`
- `src/app/pages/work/work.scss`
- `wiki/clients/localhouse-designs.md`

Summary:
- Reframed the Localhouse work page so it sells proof more directly instead of reading like a broader portfolio list.
- Reordered the top case studies around the current offer hierarchy: North Styles first, Local GEO Standard second, then NorCal and Prescribed Burn.
- Rewrote the main case-study summaries, subtitles, and metrics so each project explains what it proves: platform replacement, repeatable local visibility work, hybrid-service clarification, and stronger brand-source structure.
- Added a short proof-intro block at the top of the work page to explain that the section is meant to show what changed and why it mattered, not just what was built.

## [2026-04-23] ingest | Prescribed Burn stockist page rollout

Touched:
- `raw/sources/2026-04-23-prescribed-burn-stockist-page.md`
- `audits/prescribed-burn-sauces-audit-2026-04-20.md`
- `wiki/clients/prescribed-burn-sauces.md`
- `index.md`

Summary:
- Logged the new Prescribed Burn `/sold-at` page that turns recent in-person retail presence into a first-party stockist surface on the official domain.
- Recorded the guardrails used for the rollout: no co-ops, no personal contacts, no price or stock-count claims, and a clear call-ahead disclaimer for availability.
- Reframed the stockist page as both a customer-helpful page and an entity-control move so retailer intent is less dependent on third-party listings alone.
