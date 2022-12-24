const got = require('@/utils/got');
const cheerio = require('cheerio');
// https://www.usenix.org/conference/usenixsecurity20/technical-sessions
const url = 'https://www.usenix.org/';

// const map = new Map([
//     ['spring', { title: 'Spring Accepted Papers', suffix: 'spring-accepted-papers' }],
//     ['summer', { title: 'Summer Accepted Papers', suffix: 'summer-accepted-papers' }],
//     ['fall', { title: 'Fall Accepted Papers', suffix: 'fall-accepted-papers' }],
//     ['winter', { title: 'Winter Accepted Papers', suffix: 'winter-accepted-papers' }],
// ]);

const list = ['spring-accepted-papers', 'summer-accepted-papers', 'fall-accepted-papers', 'winter-accepted-papers'];

module.exports = async (ctx) => {
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
                            author: authors,
                            description: description,
                        };
                    });
                    items = await Promise.all(promises).then((res) => {
                        return items.concat(res);
                    });
                } catch (error) {}
            })
        );
    }

    ctx.state.data = {
        title: 'usenix',
        link: url,
        description: 'USENIX Accpeted Papers',
        allowEmpty: true,
        item: items,
    };
};
