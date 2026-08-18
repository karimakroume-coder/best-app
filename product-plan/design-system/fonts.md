# Typography Configuration

## Google Fonts Import

Add to your HTML `<head>` or CSS:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Pacifico&family=Times+New+Roman:wght@400;700&display=swap" rel="stylesheet">
```

## Font Usage

- **Display / Headlines:** Times New Roman Bold — BEST logo wordmark (tricolor banded), championship weight, rank numbers
- **UI / Body:** Bebas Neue — Buttons, labels, rank numbers, category strips. Condensed, bold, commanding
- **Script / Accent:** Pacifico — AI poetic descriptions, soft accents, handwritten warmth

## Font Stacks

```css
--font-display: 'Times New Roman', Georgia, serif;
--font-ui: 'Bebas Neue', Impact, sans-serif;
--font-script: 'Pacifico', cursive;
```

## Aesthetic Notes

- Rank numbers: Times New Roman Bold at 80-140px with 3-layer emboss shadow
- Buttons: Bebas Neue at 10-13px, uppercase, wide letter-spacing
- AI descriptions: Pacifico italic at 13-17px, 70% opacity
- Titles: Bebas Neue at 28-48px, uppercase, 3px letter-spacing
- Creator names: Bebas Neue at 13-16px, gold color, 2px letter-spacing
