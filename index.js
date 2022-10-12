require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const URL = require('url').URL;
const bodyParser = require('body-parser');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});
const isValidUrl = (urlString) => {
    try {
        return Boolean(new URL(urlString));
    } catch (e) {
        return false;
    }
};
let id = 0;
const urls = [];
// Your first API endpoint
app.post('/api/shorturl', function (req, res) {
    const originalURL = req.body.url;
    const pattern = /^((http|https|ftp):\/\/)/;
    if (isValidUrl(originalURL) && pattern.test(originalURL)) {
        const urlObject = new URL(originalURL);

        dns.lookup(urlObject.hostname, (error) => {
            if (error) {
                console.log(error);
                res.json({ error: 'invalid error' });
            } else {
                id += 1;
                urls.push({ id: id, url: urlObject.href });
                res.json({ original_url: urlObject.href, short_url: id });
                console.log(urls);
            }
        });
    } else {
        res.json({ error: 'invalid error' });
    }
});
app.get('/api/shorturl/:id', (req, res) => {
    const id = req.params.id;
    const url = urls.find((item) => {
        return item.id === Number(id);
    });
    res.redirect(`${url.url}`);
});
app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});
