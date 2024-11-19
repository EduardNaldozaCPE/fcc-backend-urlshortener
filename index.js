require('dotenv').config();
const dns = require('dns');
const url = require('url');
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require("body-parser");


// Basic Configuration
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded());
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// app.get('/api/shorturl/:short_url', (req, res)=>{

// });

app.post("/api/shorturl/", verifyDNS, (req, res)=>{
  let url = req.body.url;
  return res.json({});
});

// Verify if the URL follows the "http://www.example.com/" format
function verifyURL(req, res, next) {
  console.log('Verifying URL');
  try {
    let _ = new url.URL(req.body.url);
  } catch (err) {
    console.log(err);
    if (err instanceof TypeError)
      return res.json({ error:'invalid url' });
  }
  next();
}

// Verify if the URL is has a valid domain name.
function verifyDNS(req, res, next) {
  console.log('Verifying DNS');

  dns.lookup(req.body.url, (err, address, family)=>{
    if (err) {
      console.error(err);
      return res.json({ error:'invalid url' });
    }
    console.log({address, family});
    next();
  });
}

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
