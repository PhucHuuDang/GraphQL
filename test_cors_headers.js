const express = require('express');
const cors = require('cors');
const request = require('supertest');

const app = express();
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use('/test', (req, res) => res.json({ok: true}));

request(app)
  .options('/test')
  .set('Origin', 'http://foo.com')
  .set('Access-Control-Request-Headers', 'content-type')
  .expect(res => console.log('Headers returned are:', res.headers['access-control-allow-headers']))
  .end(err => err && console.error(err));
