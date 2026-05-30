# CLA-31: Transparent Anchor Card

## Before Evidence

Actual local app capture, not a synthetic recreation.

- Issue: `CLA-31`
- View: `http://127.0.0.1:4178/v1-discovery-map/index.html?mode=places&place=nevada-theatre-nevada-city`
- Selected place: `Nevada Theatre`
- Card class: `.detail-card.primary-anchor-card`
- Screenshot: `before-transparent-anchor-card.png`
- Full viewport screenshot: `before-transparent-anchor-card-full-page.png`

What the screenshot shows: the primary cultural anchor detail card is transparent below its top gradient, so map roads, labels, and terrain show through behind the card text. Ordinary place cards are intended to be solid.

Live computed style at capture time:

```text
backgroundImage: linear-gradient(rgba(255, 46, 0, 0.08), rgba(255, 255, 255, 0) 132px)
backgroundColor: rgba(0, 0, 0, 0)
```

## Approved Target Direction

`target-approved-anchor-card-direction.png` is an AI-generated target-state mockup approved by the owner on 2026-05-29. It is direction, not a pixel spec: keep the actual app's existing layout, but make the cultural anchor card read more like the target in its opacity and surface treatment.

Scoped decision for this fix: preserve the current red anchor top treatment, but layer the gradient over an opaque surface so the card body remains readable and the map never shows through text.

## After Evidence

- Screenshot: `after-opaque-anchor-card.png`
- Full viewport screenshot: `after-opaque-anchor-card-full-page.png`

Verified in the actual local app at the same Nevada Theatre deep link. The card keeps the red top treatment, but its body is now opaque.

Live computed style after fix:

```text
backgroundImage: linear-gradient(rgba(255, 46, 0, 0.08), rgba(255, 255, 255, 0) 132px), none
backgroundColor: rgb(255, 255, 255)
```
