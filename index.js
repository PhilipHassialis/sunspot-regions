import chalk from "chalk";
import { gotScraping } from "got-scraping";
import { JSDOM } from "jsdom";

const START_REGION = 8124;
const END_REGION = 13425;

const error = chalk.red;
const success = chalk.green;
const info = chalk.blue;
const warning = chalk.yellow;

function processTop10(regionNumber, tableTop10) {
  const top10 = [];
  const initialLine = `${regionNumber},`;
  tableTop10.querySelectorAll("tr").forEach((row, index) => {
    let line = initialLine;
    const columns = row.querySelectorAll("td");
    columns.forEach((column, index) => {
      if (index === 0) {
        line += column.textContent.trim();
      } else {
        line += `,${column.textContent.trim()}`;
      }
    });
    if (line !== initialLine) top10.push(line.substring(0, line.length - 1));
  });
  return top10;
}

function processSunspotRegions(regionNumber, tableSunspotRegions) {
  const sunspotRegions = [];
  const initialLine = `${regionNumber},`;
  let line = "";

  tableSunspotRegions.querySelectorAll("tr").forEach((row, index) => {
    line = initialLine;
    const columns = row.querySelectorAll("td");
    if (columns.length === 6) {
      columns.forEach((column, index) => {
        if (index === 0) {
          line += column.textContent.trim();
        } else {
          if (column.textContent.trim() === "") {
            const iClass = column.querySelector("i").className;
            if (iClass.split(" ").length > 1) {
              line += `,${iClass.split(" ")[1]}`;
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
  return sunspotRegions;
}

async function getRegionInfo(regionNumber) {
  const url = `https://www.spaceweatherlive.com/en/solar-activity/region/${regionNumber}.html`;

  console.log(info(`Processing ${url}`));

  try {
    const res = await gotScraping(url, {
      responseType: "text",
      resolveBodyOnly: true,
      retry: {
        limit: 3,
      },
    });
    if (res.error) {
      console.log(error("Caught error in res.error"));
    } else {
      const dom = new JSDOM(res);
      const tables = dom.window.document.querySelectorAll(".table-striped");

      if (tables.length < 3) {
        console.log(warning("Unexpected page format"));
        return;
      }

      const tableSunspotRegions = tables[0];

      let sunspotRegions = [];
      let top10 = [];

      sunspotRegions = processSunspotRegions(regionNumber, tableSunspotRegions);

      if (tables.length === 4) {
        if (tables[1]) {
          console.log(info("Detected secondary table"));
        }
        top10 = processTop10(regionNumber, tables[1]);
      }

      console.log(sunspotRegions);

      if (top10.length) {
        console.log(top10);
      }

      console.log(success(`Processed ${url}`));
    }
  } catch (err) {
    console.log(error("Caught error in catch"), err);
  }
}

getRegionInfo(11210);
