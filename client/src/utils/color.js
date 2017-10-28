import { range } from 'ramda';
import { scaleSequential } from 'd3-scale';
import { interpolateRdYlBu } from 'd3-scale-chromatic';

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

const parse16 = (str, start, len) => parseInt(str.substr(start, len), 16);

const uint8Colors = colorMap.map(c => ([
  parse16(c, 1, 2),
  parse16(c, 3, 2),
  parse16(c, 5, 2),
  255,
]));

export function colorToByteArray(c) {
  return uint8Colors[c];
}

const hexToInt = (str, begin, end) => parseInt(str.substr(begin, end - begin), 16);

export function hexColorToByteArray(c) {
  return [
    hexToInt(c, 1, 3),
    hexToInt(c, 3, 5),
    hexToInt(c, 5, 7),
    255,
  ];
}

const matchRGB = /rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/;
function rgbToByteArray(rgb) {
  const match = matchRGB.exec(rgb);
  return [match[1], match[2], match[3], 255];
}

const MAX_DIFFICULTY = 30;
const backgroundColor = [34, 34, 34, 255];
const colorScale = scaleSequential(interpolateRdYlBu).domain([MAX_DIFFICULTY, 0]);
const difficultyColors = range(0, MAX_DIFFICULTY).map(colorScale).map(rgbToByteArray);

export function difficultyToByteArray(d) {
  if (d <= 0) return backgroundColor;
  return difficultyColors[d];
}

export function fillImageData(getColorArray, data, matrix) {
  if (data.length !== (matrix.length * matrix[0].length) * 4) {
    throw new Error(`Wrong ImageData length: ${data.length} vs ${matrix.length * matrix[0].length * 4}`);
  }

  for (let rowIdx = 0; rowIdx < matrix.length; rowIdx += 1) {
    for (let colIdx = 0; colIdx < matrix[rowIdx].length; colIdx += 1) {
      const i = (rowIdx * matrix.length * 4) + (colIdx * 4);
      const colorArr = getColorArray(matrix[rowIdx][colIdx]);
      data[i] = colorArr[0];      // eslint-disable-line no-param-reassign
      data[i + 1] = colorArr[1];  // eslint-disable-line no-param-reassign
      data[i + 2] = colorArr[2];  // eslint-disable-line no-param-reassign
      data[i + 3] = colorArr[3];  // eslint-disable-line no-param-reassign
    }
  }
}
