import fs from "fs";
import chalk from "chalk";
import { gotScraping } from "got-scraping";
import { JSDOM } from "jsdom";

const START_REGION = 8124;
const END_REGION = 13425;
const SUNSPOT_REGIONS_FILE = "sunspot-regions.csv";
const TOP10_FILE = "top10.csv";
const ERROR_FILE = "errors.txt";

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

function writeToFile(sunspotRegions, top10) {
  fs.appendFileSync(SUNSPOT_REGIONS_FILE, "\n");
  fs.appendFileSync(SUNSPOT_REGIONS_FILE, sunspotRegions.join("\n"));

  if (top10.length) {
    fs.appendFileSync(TOP10_FILE, "\n");
    fs.appendFileSync(TOP10_FILE, top10.join("\n"));
  }
}

function logError(errorURL) {
  fs.appendFileSync(ERROR_FILE, `Couldn't process ${errorURL}\n`);
}

function initFiles() {
  fs.writeFileSync(
    SUNSPOT_REGIONS_FILE,
    "Regiom,Date,Sunspots,Size,Class Magnitude,Class Spot,Location"
  );
  fs.writeFileSync(
    TOP10_FILE,
    "Region,Redion Top 10 Id,Date,Start,Maximum,End"
  );
}

async function getRegionInfo(isVerbose, regionNumber) {
  const url = `https://www.spaceweatherlive.com/en/solar-activity/region/${regionNumber}.html`;

  if (isVerbose) console.log(info(`Processing ${url}`));

  try {
    const res = await gotScraping(url, {
      responseType: "text",
      resolveBodyOnly: true,
      retry: {
        limit: 3,
      },
    });
    if (res.error) {
      if (isVerbose) console.log(error("Caught error in res.error"));
    } else {
      const dom = new JSDOM(res);
      const tables = dom.window.document.querySelectorAll(".table-striped");

      if (tables.length < 3) {
        logError(url);
        if (isVerbose) console.log(warning("Unexpected page format"));
        return;
      }

      const tableSunspotRegions = tables[0];

      let sunspotRegions = [];
      let top10 = [];

      sunspotRegions = processSunspotRegions(regionNumber, tableSunspotRegions);

      if (tables.length === 4) {
        if (tables[1]) {
          if (isVerbose) console.log(info("Detected secondary table"));
        }
        top10 = processTop10(regionNumber, tables[1]);
      }

      writeToFile(sunspotRegions, top10);

      if (isVerbose) console.log(success(`Processed ${url}`));
    }
  } catch (err) {
    if (isVerbose) console.log(error("Caught error in catch"), err);
  }
}

async function processRegions() {
  const isVerbose = process.argv[2] === "--verbose";

  for (
    let regionNumber = START_REGION;
    regionNumber <= END_REGION;
    regionNumber++
  ) {
    await getRegionInfo(isVerbose, regionNumber);
  }
}

initFiles();
processRegions();
