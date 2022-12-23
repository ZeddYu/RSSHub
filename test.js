const got = require('got');
const cheerio = require('cheerio');
const { managedidentities } = require('googleapis/build/src/apis/managedidentities');
// const { parseDate } = require('@/utils/parse-date');
// https://www.usenix.org/conference/usenixsecurity20/technical-sessions
const url = 'https://www.usenix.org/';

// const map = new Map([
//     ['spring', { title: 'Spring Accepted Papers', suffix: 'spring-accepted-papers' }],
//     ['summer', { title: 'Summer Accepted Papers', suffix: 'summer-accepted-papers' }],
//     ['fall', { title: 'Fall Accepted Papers', suffix: 'fall-accepted-papers' }],
//     ['winter', { title: 'Winter Accepted Papers', suffix: 'winter-accepted-papers' }],
// ]);

const list = ['spring-accepted-papers', 'summer-accepted-papers', 'fall-accepted-papers', 'winter-accepted-papers'];

async function main() {
    let items = new Map();
    for (let index = 22; index < 23; index++) {
        //check if usenix'${index} exists
        let link = `${url}/usenixsecurity${index}/`;
        try {
            let response = await got.get(link);
        } catch (error) {
            console.error(`${link}: ${error.response.statusCode}`);
            break;
        }

        // Some usenix may not have all fourt quarter sections
        // So we need to iterate through the four sections
        list.forEach(async (suffix) => {
            let link = `${url}/usenixsecurity${index}/${suffix}`;
            try {
                let response = await got.get(link);
                console.log;
                const $ = cheerio.load(response.body);
                let articles = $('article').get();
                articles.map((article) => {
                    const item = $(article);
                    const title = item.find('h2.node-title > a').text().trim();
                    const href = item.find('h2.node-title > a').attr('href');
                    const authors = item.find('div.field.field-name-field-paper-people-text.field-type-text-long.field-label-hidden p').text();
                    return {
                        title: title,
                        pubDate: new Date().toUTCString(),
                        link: `${url}${href}`,
                    }
                });
            } catch (error) {
                console.log(error);
                // console.error(`${link}: ${error.response.statusCode}`);
            }
        });
    }
}

async function test() {
    let link = `https://www.usenix.org/conference/usenixsecurity23/summer-accepted-papers`;
    try {
        let response = await got.get(link);
        const $ = cheerio.load(response.body);
        let articles = $('article.node-paper').get();
        
        // console.log(articles)
        const items = articles.map((article) => {
            const item = $(article);
            const title = item.find('h2.node-title > a').text().trim();
            const href = item.find('h2.node-title > a').attr('href');
            const authors = item.find('div.field.field-name-field-paper-people-text.field-type-text-long.field-label-hidden p').text();
            return {
                title: title,
                pubDate: new Date().toUTCString(),
                link: `${url}${href}`,
            }
        });
        console.log(items)
        return items;
    } catch (error) {
        console.log(error);
        // console.error(`${link}: ${error.response.statusCode}`);
    }
}

test();
