require('dotenv').config();
const dns = require('dns');
const url = require('url');
const express = require('express');
const cors = require('cors');
const app = express();
const net = require('net');
const bodyParser = require("body-parser");


// Basic Configuration
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded());
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

const urlCollection = [];

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/shorturl/:short_url', (req, res)=>{
  let urlDoc = urlCollection.find((u)=>u.short_url == parseInt(req.params.short_url));
  if (urlDoc === undefined)
    res.json({"error":"No short URL found for the given input"});
  else
    res.redirect(urlDoc.original_url);
});

// Add record to urlCollection
app.post("/api/shorturl", verifyURL, verifyDNS, (req, res)=>{
  let original_url = req.body.url;
  let short_url;

  // Set the short_url to the maximum 
  if (urlCollection.length == 0) {
    short_url = 1;
  } else {
    urlCollection.sort((a,b)=>a.short_url - b.short_url);
    short_url = urlCollection[urlCollection.length-1].short_url+1;
  }

  let urlDoc = {original_url, short_url};

  urlCollection.push(urlDoc)

  return res.json(urlDoc);
});

// VERIFICATION MIDDLEWARE

// Verify if the URL follows the "http://www.example.com/" format
function verifyURL(req, res, next) {
  console.log('Verifying URL');
  let workingURL = req.body.url;

  try {
    new url.URL(workingURL);
  } catch (err) {
    console.log(err);
    if (err instanceof TypeError)
      return res.json({ error:'invalid url' });
  }
  next();
}

// Verify if the URL is a valid DNS.
function verifyDNS(req, res, next) {
  console.log('Verifying DNS');
  workingURL = new url.URL(req.body.url).hostname;
  
  // Make sure the domain isn't an IP address 
  if (net.isIP(workingURL)) {
    console.error("The URL is an IP Address");
    return res.json({ error:'invalid url' });
  }

  // Note: dns.lookup() allows strings that look like ipv4 addresses
  // I'm setting {family: 6} so that we make sure it doesn't allow ip addresses
  dns.lookup(workingURL, (err, address, family)=>{
    if (err) {
      console.error(err);
      return res.json({ error:'invalid url' });
    }
    next();
  });
}

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
