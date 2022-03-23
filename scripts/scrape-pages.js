import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs';

const savedUrlsFilePath = 'urls.json';
const savedPagesPath = 'pages/';

const savedNewsReleaseUrls = JSON.parse(fs.readFileSync(savedUrlsFilePath));

for (const url of savedNewsReleaseUrls) {
    const urlEncoded = Buffer.from(url).toString('base64');
    const savedPagePath = `${savedPagesPath}${urlEncoded}.json`;

    if (fs.existsSync(savedPagePath)) {
        console.log(`already saved: ${url}`);

        continue; // Stop if we've already saved this URL.
    }

    const pageHtml = await fetchPage(url);

    const articleContent = extractArticle(pageHtml);

    const pageData = {
        path: url,
        ...articleContent
    };

    fs.writeFileSync(savedPagePath, JSON.stringify(pageData, null, 2));

    console.log(`scraped and saved: ${url} at ${savedPagePath}`);
}

async function fetchPage(pagePath) {
    const response = await fetch(`https://pm.gc.ca/${pagePath}`, {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "max-age=0"
          },
          "body": null,
          "method": "GET"
    });
    const responseHTML = await response.text();

    return responseHTML;
}

function extractArticle(html) {
    const $ = cheerio.load(html);

    const pageTitle = $('title').text();
    const articleHtml = $('.content-news-article').html();

    return {
        pageTitle,
        articleHtml
    };
}
