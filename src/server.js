require('dotenv').config()
const express = require('express');
const axios = require('axios');
const app = express();

const getBotType = (req) => {
  const userAgent = req.get('User-Agent').toLowerCase();

  if (userAgent.indexOf('slackbot') > -1) return 'Slack';

  if (req.get('User-Agent').match('(Twitterbot(.*)facebookexternalhit)|(facebookexternalhit(.*)Twitterbot)')) return 'iMessage';

  if (userAgent.indexOf('embedly') > -1) return 'Notion';

  if (userAgent.indexOf('notion') > -1) return 'Notion';

  if (userAgent.indexOf('discordbot') > -1) return 'Discord';

  if (userAgent.indexOf('telegrambot') > -1) return 'Telegram';

  if (userAgent.indexOf('twitterbot') > -1) return 'Twitter';

  if (userAgent.indexOf('facebook') > -1) return 'Facebook';

  if (userAgent.indexOf('linkedin') > -1) return 'LinkedIn';

  if (userAgent.indexOf('redditbot') > -1) return 'Reddit';

  if (userAgent.indexOf('whats') > -1) return 'WhatsApp';

  if (userAgent.indexOf('nimbus') > -1) return 'Nimbus';

  if (userAgent.indexOf('signal') > -1) return 'Signal';

  if (userAgent.indexOf('intercom') > -1) return 'Intercom';

  if (userAgent.indexOf('asana') > -1) return 'Asana';

  if (userAgent.indexOf('trello') > -1) return 'Trello';

  if (userAgent.indexOf('jira') > -1) return 'jira';

  if (userAgent.indexOf('skype') > -1) return 'skype';

  if (userAgent.indexOf('drift') > -1) return 'Drift';

  return null;
};

const isCustomDomain = (req) => {
  return req.hostname.toLowerCase() !== 'markuphero.com'
      && req.hostname.toLowerCase() !== 'www.markuphero.com'
      && req.hostname.toLowerCase() !== 'dev.markuphero.com'
      && req.hostname.toLowerCase() !== 'localhost';
}

const waitUntilDownloadReady = (downloadIdentifier) => {
  const MAX_TIME_TRIES = 10;
  return new Promise((resolve, reject) => {
    let startTime = (new Date()).getTime();
    let callingApi = false;
    const tid = setInterval(async () => {
      if (callingApi) {
        return;
      }

      if (startTime + (MAX_TIME_TRIES * 1000) < (new Date()).getTime()) {
        clearInterval(tid);
        reject('Exceeded total allowed time for downloading markup');
        return;
      }

      try {
        callingApi = true;
        await axios.get(`${process.env.VUE_APP_BASE_API_URL}/markUp/checkDownload/${downloadIdentifier}`);
        clearInterval(tid);
        resolve();
      } catch(err) {
        if (err.response.status !== 404) {
          clearInterval(tid);
          reject(err);
        }
      } finally {
        callingApi = false;
      }
    }, 250);
  });
};

const trackBotEmbed = async (event) => {
  try {
    if (!process.env.VUE_APP_ANALYTICS_API_URL) return;

    event.name = 'bot_embed';
    await axios.post(`${process.env.VUE_APP_ANALYTICS_API_URL}/Event`, event);
  } catch (err) {
    console.error(err);
  }
};

app.use((req, res, next) => {
  if (req.url !== '/') res.set('Cache-Control', 'public, max-age=432000');
  else res.set('Cache-Control', 'no-cache');
  next();
});

app.use(async (req, res, next) => {
  if (getBotType(req)) {
    try {
      if (req.url.indexOf('/share/') === 0) {
        let baseApiUrl = isCustomDomain(req) ? `${req.protocol}://${req.get('host')}/api` : process.env.VUE_APP_BASE_API_URL;

        const matches = req.url.match('.*\/share\/([a-zA-Z0-9]*)\/?([0-9]+)?');
        const markUpId = matches[1];
        const pageNumber = matches[2] ? Number(matches[2]) : 1;

        let response = await axios.get(`${baseApiUrl}/markUp/${markUpId}`);
        const markUp = response.data;
        if (markUp && !markUp.isHidden && markUp.pages.length > 0 && pageNumber <= markUp.pages.length) {
          const markUpPage = markUp.pages[pageNumber - 1];
          const imageIdentifier = markUpPage.imageIdentifier;
          response = await axios.get(`${baseApiUrl}/markUp/${markUpId}/${imageIdentifier}/downloadIdentifier`);
          const downloadIdentifier = response.data.downloadIdentifier;
          await waitUntilDownloadReady(downloadIdentifier);
          const imageUrl = `${baseApiUrl}/markUp/${markUpId}/${downloadIdentifier}/download`;

          let teamBrand = null;
          let brandSuffix = 'Markup Hero';
          if (isCustomDomain(req)) {
            teamBrand = (await axios.get(`${baseApiUrl}/team/brand`)).data;
            if (teamBrand && teamBrand.teamName) brandSuffix = teamBrand.teamName;
          }

          let titleSuffix = markUp.title || 'Markup';

          trackBotEmbed({
            value1: markUpId,
            value2: getBotType(req),
            value3: pageNumber,
            fullUrl: req.url
          });

          return res.type('.html').status(200).send(`
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta http-equiv="X-UA-Compatible" content="IE=edge">
              <meta name="viewport" content="width=device-width,initial-scale=1.0">
              <meta name="slack-app-id" content="A014TEF7TB5">
          
              <meta property="og:title" content="View ${titleSuffix} - ${brandSuffix} (${pageNumber} of ${markUp.pages.length} pages)" />
              <meta property="og:description" content="View this markup created by ${markUp.createdByName}.${isCustomDomain(req) ? '' : ' Duplicate to edit and add your own annotations.'}" />
              <meta property="og:image:type" content="image/png" />
              <meta property="og:image" content="${imageUrl}" />
              <meta property="og:image:secure_url" content="${imageUrl}" />
              <meta property="og:url" content="${req.protocol + '://' + req.get('Host') + req.url}" />
              
              <meta name="twitter:card" content="summary_large_image">
              <meta name="twitter:site" content="${isCustomDomain(req) ? '' : '@markuphero'}">
              <meta name="twitter:creator" content="${markUp.createdByName}">
              <meta name="twitter:title" content="View ${titleSuffix} - ${brandSuffix} (${pageNumber} of ${markUp.pages.length} pages)">
              <meta name="twitter:description" content="">
              <meta name="twitter:image" content="${imageUrl}">
              
              <link rel="icon" href="${isCustomDomain(req) ? 'https://markuphero.com/generic-favicon.ico' : 'https://markuphero.com/favicon.ico'}">
              
              <link rel="apple-touch-icon" href="${imageUrl}">
              
              <title>${titleSuffix} - ${brandSuffix} (${pageNumber} of ${markUp.pages.length} pages)</title>
            </head>
            <body>
              <img src="${imageUrl}"/>
            </body>
          </html>
        `);
        }
      }
    } catch (err) {
      return res.send(500);
    }
  }

  next();
});

app.use(express.static('dist'));

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache');
  return res.sendfile('dist/index.html');
});

app.listen(8080);