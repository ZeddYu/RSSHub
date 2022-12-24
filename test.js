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
    let items = [];
    for (let index = 22; index < 23; index++) {
        //check if usenix'${index} exists
        let link = `${url}/conference/usenixsecurity${index}/`;
        try {
            let response = await got.get(link);
        } catch (error) {
            console.error(`${link}: ${error.response.statusCode}`);
            break;
        }

        // Some usenix may not have all fourt quarter sections
        // So we need to iterate through the four sections
        await Promise.all(
            list.map(async (suffix) => {
                let link = `${url}/conference/usenixsecurity${index}/${suffix}`;
                try {
                    let response = await got.get(link);
                    const $ = cheerio.load(response.body);
                    const time = $('meta[property=article:modified_time]').attr('content');

                    let articles = $('article.node-paper').get();
                    let promises = articles.map(async (article) => {
                        const item = $(article);
                        const title = item.find('h2.node-title > a').text().trim();
                        const href = item.find('h2.node-title > a').attr('href');
                        const authors = item.find('div.field.field-name-field-paper-people-text.field-type-text-long.field-label-hidden p').text();
                        response = await got.get(`${url}${href}`);
                        const $$ = cheerio.load(response.body);
                        const description = $$('div.field-name-field-paper-description > div.field-items > div').text().replaceAll('\n', '<br>');

                        return {
                            title: title,
                            pubDate: new Date(time).toUTCString(),
                            link: `${url}${href}`,
                            authors: authors,
                            description: description,
                        };
                    });
                    items = await Promise.all(promises).then((res) => {
                        return items.concat(res);
                    });
                } catch (error) {
                    console.log(error);
                }
            })
        );
    }
    console.log('------------');
    console.log(items);
}

async function test() {
    let items = [];
    let link = `https://www.usenix.org/conference/usenixsecurity23/summer-accepted-papers`;
    try {
        let response = await got.get(link);
        const $ = cheerio.load(response.body);
        let articles = $('article.node-paper').get();
        const time = $('meta[property=article:modified_time]').attr('content');
        console.log(time);

        // console.log(articles)
        let promises = articles.map(async (article) => {
            const item = $(article);
            const title = item.find('h2.node-title > a').text().trim();
            const href = item.find('h2.node-title > a').attr('href');
            const authors = item.find('div.field.field-name-field-paper-people-text.field-type-text-long.field-label-hidden p').text();
            response = await got.get(`${url}${href}`);
            const $$ = cheerio.load(response.body);
            const description = $$('div.field-name-field-paper-description > div.field-items > div').text().replaceAll('\n', '<br>');

            return {
                title: title,
                pubDate: new Date(time).toUTCString(),
                link: `${url}${href}`,
                authors: authors,
                description: description,
            };
        });
        items = await Promise.all(promises).then((res) => {
            return items.concat(res);
        });
        // console.log(items);
        // return items;
    } catch (error) {
        console.log(error);
        // console.error(`${link}: ${error.response.statusCode}`);
    }
    console.log(items);
}

// test();
main();

// const array1 = [1, 4, 9, 16];
// let arr = [];

// // pass a function to map
// arr = arr.concat(
//     array1.map((x) => {
//         return {
//             a: '1',
//         };
//     })
// );
// arr = arr.concat(
//     array1.map((x) => {
//         return {
//             a: '1',
//         };
//     })
// );
// console.log(arr);
// console.log(typeof arr);
