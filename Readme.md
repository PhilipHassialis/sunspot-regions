# Sunspot Regions Scraper

A minimal region scraper for [spaceweatherlive](https://www.spaceweatherlive.com/en/solar-activity/region.html). It will scrap regions from `START_REGION` (atm hardcoded to 8124) to `END_REGION` (atm hardcoded to 13425) and output the region info and the top 10 info to two separate csv files.

## Prerequisites

A recent (18.17 as of this writing) version of [NodeJS](https://nodejs.org/en)

## Usage

- Clone this repository
- Install packages (`npm -ci`)
- Run the program (`npm run start`)

## Command line options

If you want to observe the program progress as it runs run it with the `--verbose` option (`npm run start -- --verbose`)

## Output

The program outputs three files:

- `sunspot-regions.csv`: the main output data file for each region
- `top10.csv`: the secondary output data file for the top 10 sunspots in said region. **Important**: Not all regions contain top 10 information
- `errors.txt`: the URLs that couldn't be scraped due to format misalignment, non existing information, etc.

## Contributions

Many thanks to [Giorgos Karanikas](https://www.linkedin.com/in/gkaran/?originalSubdomain=gr) for his technical contribution on achieving a proper scraping result.
