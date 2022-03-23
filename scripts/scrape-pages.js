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

function extractArticle(html) {
    const $ = cheerio.load(html);

    const pageTitle = $('title').text();
    const articleHtml = $('.content-news-article').html();

    return {
        pageTitle,
        articleHtml
    };
}

const pageHtml = await fetchPage("/en/news/news-releases/2017/05/19/prime-minister-announces-changes-senior-ranks-public-service");

const articleContent = extractArticle(pageHtml);

console.log({
    path: "/en/news/news-releases/2017/05/19/prime-minister-announces-changes-senior-ranks-public-service",
    ...articleContent
});



// TBD: save entire page? save just article content? save article content and something else?
//      if we save just content, we can just wrap it in an `<html><body></body></html>` to make it parseable ¯\_(ツ)_/¯
//      the only other bit we might want would be page title, which maybe we just pull separately
