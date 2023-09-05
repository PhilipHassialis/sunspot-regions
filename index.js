import got from 'got';
import { JSDOM } from 'jsdom';

const url = `https://www.spaceweatherlive.com/en/solar-activity/region/8124.html`;

got(url).then(response => {

    const dom = new JSDOM(response.body);
    const tables = dom.window.document.querySelectorAll('.table-striped');

    // console.log(tables.length)

    if (tables.length < 3) {
        throw new Error('Unexpected page format');
    }


    const tableSunspotRegions = tables[0];

    const sunspotRegions = [];
    const top10 = [];
    const initialLine = "8124,"
    let line = "";

    tableSunspotRegions.querySelectorAll('tr').forEach((row, index) => {
        line = initialLine;
        const columns = row.querySelectorAll('td');
        if (columns.length === 6) {
            columns.forEach((column, index) => {
                if (index === 0) {
                    line += column.textContent.trim();
                } else {
                    if (column.textContent.trim() === "") {
                        const iClass = column.querySelector('i').className;
                        if (iClass.split(' ').length > 1) {
                            line += `,${iClass.split(' ')[1]}`;
                        } else {
                            line += `,`;
                        }
                    } else {
                        line += `,${column.textContent.trim()}`;
                    }
                }
            });
            sunspotRegions.push(line);
        }
    });

    if (tables.length === 4) {

        const tableTop10 = tables[1];
        tableTop10.querySelectorAll('tr').forEach((row, index) => {
            line=initialLine;
            const columns = row.querySelectorAll('td');
            columns.forEach((column, index) => {
                if (index === 0) {
                    line += column.textContent.trim();
                } else {
                    line += `,${column.textContent.trim()}`;
                }
            });
            if (line !== initialLine) top10.push(line.substring(0, line.length - 1));
        });

    }




    console.log(sunspotRegions)

    if (top10.length) {
        console.log(top10)
    }
});
