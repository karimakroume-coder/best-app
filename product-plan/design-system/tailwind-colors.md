# Tailwind Color Configuration

## Color Choices

BEST uses custom hex colors (not Tailwind palette names). Configure your `tailwind.config.js` with these extensions:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#F0C040',
          bright: '#D4A017',
          mid: '#B8860B',
          deep: '#8B4513',
        },
        bordeaux: {
          DEFAULT: '#5C1A1A',
        },
        parchment: {
          DEFAULT: '#F5E6C8',
        },
        best: {
          background: '#0D0800',
        },
      },
      fontFamily: {
        display: ["'Times New Roman'", 'Georgia', 'serif'],
        ui: ["'Bebas Neue'", 'Impact', 'sans-serif'],
        script: ["'Pacifico'", 'cursive'],
      },
    },
  },
}
```

## Usage Examples

Primary gold accent: `text-gold` or `bg-gold`
Embossed text: Use the 3-layer shadow system with CSS (see tokens.css)
Bordeaux surface: `bg-bordeaux`
Parchment text: `text-parchment`
Background: `bg-best-background`
UI font: `font-ui`
Display font: `font-display`
Script font: `font-script`

## Emboss Effect (CSS Only)

The emboss effect cannot be done in Tailwind alone — use inline styles or a custom utility:

```css
.emboss-gold {
  background: linear-gradient(160deg, #F0C040 0%, #D4A017 40%, #B8860B 70%, #8B4513 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 1px 1px rgba(0,0,0,0.4));
}
```
