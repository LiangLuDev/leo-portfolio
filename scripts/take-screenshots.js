import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'fs';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const targets = [
    { url: 'https://airclap.app', name: 'airclap', wait: 3000 },
    { url: 'https://storyhub.kids/', name: 'storyhub', wait: 4000 },
    { url: 'https://glyphrun.online/', name: 'glyphrun', wait: 4000 },
    { url: 'https://apps.apple.com/us/app/mydots-ideas/id6477912895', name: 'mydots', wait: 3000 },
    { url: 'https://apps.apple.com/us/app/gt-alarm-weekday-alarm-clock/id6752632723', name: 'gtalarm', wait: 3000 },
];

async function run() {
    mkdirSync('public/screenshots', { recursive: true });

    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: 'new',
        args: ['--no-sandbox', '--window-size=1440,900'],
    });

    for (const { url, name, wait } of targets) {
        console.log(`Capturing ${name}...`);
        const page = await browser.newPage();
        await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
            await new Promise((r) => setTimeout(r, wait));
            await page.screenshot({
                path: `public/screenshots/${name}.png`,
                type: 'png',
            });
            console.log(`  OK -> public/screenshots/${name}.png`);
        } catch (err) {
            console.error(`  FAIL: ${err.message}`);
        }
        await page.close();
    }

    await browser.close();
    console.log('Done.');
}

run();
