const colorMap = [
  '#FFFFFF', '#E4E4E4', '#888888', '#222222',
  '#FFA7D1', '#E50000', '#E59500', '#A06A42',
  '#E5D900', '#94E044', '#02BE01', '#00D3DD',
  '#0083C7', '#0000EA', '#CF6EE4', '#820080',
];

export const colors = colorMap;

export function colorToRGB(c) {
  return colorMap[c];
}

export function RGBToColor(rgb) {
  return colorMap.indexOf(rgb);
}
