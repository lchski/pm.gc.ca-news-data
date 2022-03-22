import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs';

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

function extractArticleContent(html) {
    const $ = cheerio.load(html);

    const articleContent = $('.content-news-article');

    return articleContent.html();
}

const pageHtml = await fetchPage("/en/news/itineraries/2022/03/01/prime-ministers-itinerary-wednesday-march-2-2022");

console.log(extractArticleContent(pageHtml));

// TBD: save entire page? save just article content? save article content and something else?
//      if we save just content, we can just wrap it in an `<html><body></body></html>` to make it parseable ¯\_(ツ)_/¯
//      the only other bit we might want would be page title, which maybe we just pull separately
