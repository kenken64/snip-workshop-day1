# Snip Design Language

A dark, minimal interface with one warm hero glow, centered confidence, and a large chat-style URL input as the main action.

## Tokens

- Background: `#070707` page base; `#101010` elevated areas; `#17130f` warm depth.
- Surface: `rgba(18, 18, 18, 0.78)` cards; `rgba(255, 255, 255, 0.06)` borders; `rgba(255, 255, 255, 0.04)` table rows.
- Text: `#fff7ef` primary; `#c9bdb5` muted; `#8f837c` quiet metadata.
- Accent gradient: `linear-gradient(135deg, #ff7a59, #ff4f8b 46%, #ffb15c)` for primary action and glow.
- Font: clean sans stack `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
- Type scale: hero `clamp(3rem, 8vw, 6.8rem)`; body `1.05rem`; card heading `1.35rem`; table `0.95rem`.
- Spacing: page `96px 0 72px`; hero gap `18px`; section gap `48px`; card padding `24px`.
- Radius: hero input `999px`; cards `28px`; notices `18px`; compact controls `999px`.
- Borders/shadows/glow: subtle 1px light borders, deep black card shadow, fixed full-width top glow with coral/pink/orange radial gradients.

## Snip Mapping

- Page header: centered hero with small eyebrow, bold headline, and muted subline.
- URL form: oversized pill chat input with attached gradient action button.
- Result and error notices: compact rounded status surfaces below the input.
- Links table: generous dark card below the hero with subtle borders, muted headers, and warm accent links.
