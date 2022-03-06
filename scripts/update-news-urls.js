import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs';

/*

Scrape _all_ news entries URLs:

1. Load existing URLs from disk.
2. Starting with N=0, load page N of pm.gc.ca news entries. Extract and store the last page number. If N = last page number, quit and save the URLs.
3. Extract the URLs. Compare URLs scraped to URLs from disk. If they all match (i.e., all the scraped URLs are already saved), stop.
4. Save expanded list of URLs, deduplicated, to disk.
5. Go to step 2, using page n+1 of pm.gc.ca news entries.

*/

const savedUrlsFilePath = 'urls.json';

let lastPageNumber = 1; // We update this in the loop.

for (let pageNumber = 0; pageNumber <= lastPageNumber; pageNumber++) { // [2, 5] (A for loop gets us the looping features we need!)
    // [1]
    const savedNewsReleaseUrls = JSON.parse(fs.readFileSync(savedUrlsFilePath));

    // [2]
    const newsPage = await scrapeNewsPage(pageNumber);

    if (pageNumber == 0) {
        lastPageNumber = extractLastPageNumber(newsPage);
    }

    // [3]
    const urls = extractUrlsFromNewsPage(newsPage);

    if (areAllUrlsInList(urls, savedNewsReleaseUrls)) {
        break; // Stopping if everything's already saved.
    }

    // [4]
    const urlsToSave = [...new Set([...urls, ...savedNewsReleaseUrls])].sort();

    fs.writeFileSync(savedUrlsFilePath, JSON.stringify(urlsToSave, null, 2));
}

function areAllUrlsInList(urlsToCheck, listToCheck) {
    return urlsToCheck.every((url) => listToCheck.includes(url))
}

async function scrapeNewsPage(pageNumber) {
    return await fetchNewsReleaseHtmlJSON(pageNumber);
}

async function fetchNewsReleaseHtmlJSON(page) {
    const response = await fetch("https://pm.gc.ca/views/ajax", {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "x-requested-with": "XMLHttpRequest",
        },
        "body": `view_name=news&view_display_id=page_1&view_args=&page=${page}`,
        "method": "POST"
    });
    const responseJSON = await response.json();

    return responseJSON;
}

function domifyNewsPage(newsPageHtmlJSON) {
    return cheerio.load(newsPageHtmlJSON.filter((contentItem) => {
        return contentItem.command == "insert" && contentItem.selector == ".js-view-dom-id-";
    }).pop()['data']);
}

function extractLastPageNumber(newsPageHtmlJSON) {
    const newsReleaseListingHtml = domifyNewsPage(newsPageHtmlJSON);

    const lastPageHref = newsReleaseListingHtml('.pager__item a[rel="last"]').attr('href');

    const lastPageNumberIndex = lastPageHref.search('[0-9]+$');

    return Number(lastPageHref.substring(lastPageNumberIndex));
}

function extractUrlsFromNewsPage(newsPageHtmlJSON) {
    const newsReleaseListingHtml = domifyNewsPage(newsPageHtmlJSON);
    
    const scrapedUrls =
        [...new Set(newsReleaseListingHtml('a')
            .toArray()
            .map((linkElement) => newsReleaseListingHtml(linkElement).attr('href'))
            .filter((link) => link.startsWith('/en/news/')))];

    return scrapedUrls;
}

