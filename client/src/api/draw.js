import axios from 'axios';

const req = axios.create({
  baseURL: 'http://127.0.0.1:8081',
});

export default (x, y, color) =>
  req.post('/draw', {
    x, y, color,
  });
