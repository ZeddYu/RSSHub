const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
// https://www.usenix.org/conference/usenixsecurity20/technical-sessions
const url = 'https://www.usenix.org/conference';

// const map = new Map([
//     ['spring', { title: 'Spring Accepted Papers', suffix: 'spring-accepted-papers' }],
//     ['summer', { title: 'Summer Accepted Papers', suffix: 'summer-accepted-papers' }],
//     ['fall', { title: 'Fall Accepted Papers', suffix: 'fall-accepted-papers' }],
//     ['winter', { title: 'Winter Accepted Papers', suffix: 'winter-accepted-papers' }],
// ]);

const list = ['spring-accepted-papers', 'summer-accepted-papers', 'fall-accepted-papers', 'winter-accepted-papers'];

module.exports = async (ctx) => {

    let items = new Map();

    for (let index = 20; index < 50; index++) {
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
                const $ = cheerio.load(response.data);
                let articles = $('article').get();
                
            } catch (error) {
                console.error(`${link}: ${error.response.statusCode}`);
            }
        });
    }

    ctx.state.data = {
        title: 'usenix',
        link: url,
        description: 'USENIX Accpeted Papers',
        item: items,
    };
};
