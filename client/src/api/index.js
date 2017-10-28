import axios from 'axios';

const req = axios.create({
  baseURL: `http://${window.location.hostname}:8081`,
});

export function draw(row, col, color) {
  return req.post('/draw', {
    x: col, y: row, color,
  });
}

export function getUpdates(every, from, to) {
  return req.get('/getUpdates', {
    params: { every, from, to },
  });
}

export function getResizings(from, to) {
  console.log(from, to);
  return req.get('/getResizings', {
    params: { from, to },
  });
}
