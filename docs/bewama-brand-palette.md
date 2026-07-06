# Bewama Brand Palette

Source inspected: `public/logo.png` and current Bewama frontend colors.

## Logo-Derived Core Colors

| Role | Hex | Usage |
| --- | --- | --- |
| Bewama Navy | `#061F3F` | Logo wordmark, primary headers, dark surfaces, trust/procurement sections |
| Deep Procurement Navy | `#03152D` | Hero overlays, footer, premium dark UI depth |
| Construction Orange | `#FF5F14` | Primary CTA, active states, quote actions, small brand accents |
| Burnt Orange Hover | `#E84F0A` | CTA hover, pressed states, high-emphasis micro-interactions |
| White | `#FFFFFF` | Logo negative space, dark-surface text, product panels |

## Current Codebase Compatibility

The Next.js store currently uses:

| Current Value | Closest Palette Role | Note |
| --- | --- | --- |
| `#003366` | Bewama Navy alternative | Slightly brighter and more corporate than the logo navy |
| `#ec5b13` | Construction Orange alternative | Very close to the logo orange and safe to keep for continuity |
| `#d14d0d` | Burnt Orange Hover | Works well for hover/active states |

Recommendation: keep `#003366` and `#ec5b13` where already implemented, but use `#061F3F` / `#03152D` for premium revamp surfaces and `#FF5F14` for the most important CTAs.

## Interface Support Colors

| Role | Hex | Usage |
| --- | --- | --- |
| Warm Canvas | `#F7F3ED` | Page background, category bands, procurement workflow sections |
| Cool Canvas | `#F4F7FA` | Product listing backgrounds, spec tables, empty states |
| Steel Border | `#D8E0EA` | Card borders, input borders, dividers |
| Slate Text | `#4B5A6A` | Secondary copy and product metadata |
| Graphite Text | `#182333` | Body text on light surfaces |
| Verified Green | `#3B7A57` | In-stock, quality assurance, verified supply states |
| Caution Amber | `#C77A13` | Low-stock, delivery notes, lead-time warnings |

## CTA Rules

- Primary commercial CTA: orange background, white text. Use for `Request Quote`, `Add to Quote`, and above-the-fold conversion.
- Buying CTA: navy background, white text. Use for `Add to Cart`, `Proceed to Checkout`, and account/order flows.
- Secondary CTA: white or transparent with navy border. Use for `Browse Catalog`, `View Specs`, and `Continue Shopping`.
- Utility CTA: text link with orange underline or arrow. Use for low-risk navigation such as `View all categories`.

## Visual Direction

Bewama should feel like a premium industrial procurement desk: confident, direct, technical, and reliable. The palette should not become a navy/orange-only theme. Use warm canvas, steel borders, product photography, and green verification states to keep the site commercially clear and visually mature.

## Asset Notes

- `public/logo.png`: official wordmark and mark; use on light surfaces.
- `html-version/Buyer-Facing/assets/bewama-draft4-hero.png`: strong hero proof image with branded packaging and warehouse context.
- `html-version/Buyer-Facing/assets/bewama-draft4-trade-strip.png`: useful for procurement/trade CTA sections.
- Product assets in `html-version/Buyer-Facing/assets/`: use as product proof, not decoration.
