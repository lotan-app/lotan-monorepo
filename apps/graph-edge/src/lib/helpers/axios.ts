import * as http from 'http';

import axios from 'axios';

export const internal = axios.create({
  headers: {
    'content-type': 'application/json',
    Authorization: `Bearer ${process.env.SYSTEM_ACCESS_TOKEN}`,
  },
  httpAgent: new http.Agent({ keepAlive: true }),
});

export const external = axios.create({
  headers: {
    'content-type': 'application/json',
  },
});
