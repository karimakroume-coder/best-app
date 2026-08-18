// The 7 BEST colors and their hex values.
export const COLOR_HEX = {
  red:    '#E74C3C',
  blue:   '#2980B9',
  green:  '#27AE60',
  yellow: '#F1C40F',
  black:  '#2C2C2C',
  white:  '#FFFFFF',
  gold:   '#F0C040',
};

export function getColorHex(name) {
  return COLOR_HEX[name] || '#555555';
}
