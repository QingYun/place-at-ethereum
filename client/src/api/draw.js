import axios from 'axios';

const req = axios.create({
  baseURL: `http://${window.location.hostname}:8081`,
});

export default (x, y, color) =>
  req.post('/draw', {
    x, y, color,
  });
