import puppeteer from 'puppeteer-core';
import sharp from 'sharp';
import { mkdirSync } from 'fs';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const apps = [
    { url: 'https://apps.apple.com/us/app/mydots-ideas/id6477912895', name: 'mydots' },
    { url: 'https://apps.apple.com/us/app/gt-alarm-weekday-alarm-clock/id6752632723', name: 'gtalarm' },
];

async function run() {
    mkdirSync('public/screenshots', { recursive: true });

    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: 'new',
    });

    for (const app of apps) {
        console.log(`Processing ${app.name}...`);
        const page = await browser.newPage();
        await page.setViewport({ width: 1440, height: 1200 });
        await page.goto(app.url, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise((r) => setTimeout(r, 5000));

        // Extract screenshot srcset - look for images with dimensions like 300x650bb (phone screenshots)
        const screenshotUrls = await page.evaluate(() => {
            const urls = [];
            document.querySelectorAll('source, img').forEach((el) => {
                const srcset = el.getAttribute('srcset') || '';
                // Phone screenshots have dimensions like NNNxNNNbb where height > width (portrait)
                // Also match Frame_ or PurpleSource in URL to filter screenshots
                if (srcset.includes('mzstatic.com') && srcset.match(/\d+x\d+bb/)) {
                    // Check if this is a screenshot (not icon) by looking at aspect ratio in URL
                    const dimMatch = srcset.match(/(\d+)x(\d+)bb/);
                    if (dimMatch) {
                        const w = parseInt(dimMatch[1]);
                        const h = parseInt(dimMatch[2]);
                        // Phone screenshots: height > width, and reasonably large
                        if (h > w && h >= 400) {
                            // Extract highest resolution from srcset
                            const parts = srcset.split(',').map(s => s.trim());
                            const last = parts[parts.length - 1].split(' ')[0];
                            // Only webp sources
                            if (last.endsWith('.webp') && !urls.includes(last)) {
                                urls.push(last);
                            }
                        }
                    }
                }
            });
            return urls;
        });

        await page.close();
        console.log(`  Found ${screenshotUrls.length} screenshot URLs`);

        if (screenshotUrls.length === 0) {
            console.log('  SKIP');
            continue;
        }

        // Upgrade to high-res: replace dimension in URL to get bigger images
        // e.g. /300x650bb-75.webp -> /600x0w-75.webp or just change to larger
        const hiResUrls = screenshotUrls.map((url) =>
            url.replace(/\/\d+x\d+bb(-\d+)?\.webp/, '/460x0w.webp')
        );

        console.log('  Downloading hi-res screenshots...');
        const buffers = [];
        for (const url of hiResUrls.slice(0, 4)) {
            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const buf = Buffer.from(await res.arrayBuffer());
                const meta = await sharp(buf).metadata();
                console.log(`    ${meta.width}x${meta.height}`);
                buffers.push(buf);
            } catch (e) {
                console.log(`    Failed: ${e.message}`);
            }
        }

        if (buffers.length === 0) {
            console.log('  SKIP: no images downloaded');
            continue;
        }

        // Composite on dark background
        const targetH = 860;
        const gap = 20;
        const padX = 60;
        const padY = 40;
        const cornerRadius = 22;

        // Resize all to same height
        const resized = [];
        for (const buf of buffers) {
            const r = await sharp(buf).resize({ height: targetH }).png().toBuffer();
            const meta = await sharp(r).metadata();
            resized.push({ buf: r, w: meta.width, h: meta.height });
        }

        const totalW = resized.reduce((s, r) => s + r.w, 0) + gap * (resized.length - 1) + padX * 2;
        const totalH = targetH + padY * 2;

        // Build composites with rounded corners
        let x = padX;
        const composites = [];
        for (const r of resized) {
            const rounded = await sharp(r.buf)
                .composite([{
                    input: Buffer.from(
                        `<svg width="${r.w}" height="${r.h}"><rect x="0" y="0" width="${r.w}" height="${r.h}" rx="${cornerRadius}" ry="${cornerRadius}" fill="white"/></svg>`
                    ),
                    blend: 'dest-in',
                }])
                .png()
                .toBuffer();
            composites.push({ input: rounded, left: x, top: padY });
            x += r.w + gap;
        }

        await sharp({
            create: {
                width: totalW,
                height: totalH,
                channels: 4,
                background: { r: 10, g: 10, b: 11, alpha: 1 },
            },
        })
            .composite(composites)
            .webp({ quality: 85 })
            .toFile(`public/screenshots/${app.name}.webp`);

        console.log(`  OK -> public/screenshots/${app.name}.webp (${totalW}x${totalH})`);
    }

    await browser.close();
    console.log('Done.');
}

run();
