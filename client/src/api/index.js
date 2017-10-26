import axios from 'axios';

const req = axios.create({
  baseURL: `http://${window.location.hostname}:8081`,
});

export function draw(x, y, color) {
  return req.post('/draw', {
    x, y, color,
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
