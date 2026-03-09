const cors = require('cors');
const req = { headers: { origin: 'http://foo.com' } };
const res = { setHeader(k, v) { console.log("SET", k, v); } };

const mw = cors({ origin: (o, cb) => cb(null, o) });
mw(req, res, () => console.log("Done"));
