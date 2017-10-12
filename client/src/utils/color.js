const colorMap = [
  '#000000',
  '#FFFFFF',
];

export function colorToRGB(c) {
  return colorMap[c];
}

export function RGBToColor(rgb) {
  return colorMap.indexOf(rgb);
}
