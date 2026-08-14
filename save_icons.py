import os
import shutil

# Source folder (where you extracted the zip)
# Copy this script to your BEST APP root folder and run it

icons = {
    "gold-dot.svg": '''<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="gold-dot-glow" x="-100%" y="-100%" width="300%" height="300%">
      <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#C8A951" flood-opacity="0.6"/>
    </filter>
  </defs>
  <circle cx="18" cy="18" r="18" fill="#C8A951" filter="url(#gold-dot-glow)"/>
</svg>''',

    "compass-arrow.svg": '''<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M24 40 L24 8 M14 18 L24 8 L34 18" stroke="#C8A951" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>''',

    "flex-camera.svg": '''<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="16" y="6" width="12" height="8" rx="2" stroke="#C8A951" stroke-width="2"/>
  <rect x="4" y="12" width="36" height="26" rx="4" stroke="#C8A951" stroke-width="2"/>
  <circle cx="22" cy="25" r="8" stroke="#C8A951" stroke-width="2"/>
</svg>''',

    "color-dot-red.svg": '''<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="12" fill="#E74C3C"/>
</svg>''',

    "color-dot-blue.svg": '''<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="12" fill="#2980B9"/>
</svg>''',

    "color-dot-green.svg": '''<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="12" fill="#27AE60"/>
</svg>''',

    "color-dot-yellow.svg": '''<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="12" fill="#F1C40F"/>
</svg>''',

    "color-dot-black.svg": '''<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="12" fill="#1A1A1A"/>
</svg>''',

    "color-dot-white.svg": '''<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="12" fill="#FFFFFF" stroke="#CCCCCC" stroke-width="1"/>
</svg>''',

    "color-dot-gold.svg": '''<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="12" fill="#C8A951"/>
</svg>''',

    "color-distribution-bar.svg": '''<svg width="320" height="4" viewBox="0 0 320 4" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="45" height="4" fill="#E74C3C"/>
  <rect x="45" y="0" width="46" height="4" fill="#2980B9"/>
  <rect x="91" y="0" width="46" height="4" fill="#27AE60"/>
  <rect x="137" y="0" width="46" height="4" fill="#F1C40F"/>
  <rect x="183" y="0" width="46" height="4" fill="#1A1A1A"/>
  <rect x="229" y="0" width="46" height="4" fill="#FFFFFF"/>
  <rect x="275" y="0" width="45" height="4" fill="#C8A951"/>
</svg>''',
}

# Target folder
target = r"C:\Users\karim\Documents\BEST APP\frontend\src\assets\icons"
os.makedirs(target, exist_ok=True)

for filename, content in icons.items():
    filepath = os.path.join(target, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Saved: {filename}")

print(f"\nAll {len(icons)} icons saved to:")
print(target)
