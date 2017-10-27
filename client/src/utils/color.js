const colorMap = [
  '#FFFFFF', '#E4E4E4', '#888888', '#222222',
  '#FFA7D1', '#E50000', '#E59500', '#A06A42',
  '#E5D900', '#94E044', '#02BE01', '#00D3DD',
  '#0083C7', '#0000EA', '#CF6EE4', '#820080',
];

const parse16 = (str, start, len) => parseInt(str.substr(start, len), 16);

const uint8Colors = colorMap.map(c => ([
  parse16(c, 1, 2),
  parse16(c, 3, 2),
  parse16(c, 5, 2),
  255,
]));

export const colors = colorMap;

export function colorToRGB(c) {
  return colorMap[c];
}

export function RGBToColor(rgb) {
  return colorMap.indexOf(rgb);
}

export function colorToByteArray(c) {
  return uint8Colors[c];
}

export function fillImageData(getColorArray, data, matrix) {
  if (data.length !== (matrix.length * matrix[0].length) * 4) {
    throw new Error(`Wrong ImageData length: ${data.length} vs ${matrix.length * matrix[0].length * 4}`);
  }

  matrix.forEach((row, rowIdx) => row.forEach((point, colIdx) => {
    const i = (rowIdx * matrix.length * 4) + (colIdx * 4);
    const colorArr = getColorArray(point);

    try {
      for (let j = 0; j < 4; j += 1) {
        data[i + j] = colorArr[j]; // eslint-disable-line no-param-reassign
      }
    } catch (e) {
      console.log(e, colorArr, point, rowIdx, colIdx);
    }
  }));
}
