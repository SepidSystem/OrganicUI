const puppeteer=require('puppeteer');
const surf=async()=>{ 
    const browser=await puppeteer.launch();
    const page=await browser.newPage();

await page.goto('http://localhost:3000/view/dashboard');
await page.goto('http://localhost:3000/view/notebook');
await page.goto('http://localhost:3000/view/dashboard');
await page.goto('http://localhost:3000/view/notebook');
await page.goto('http://localhost:3000/view/dashboard');
await page.goto('http://localhost:3000/view/notebook');
await page.goto('http://localhost:3000/view/dashboard');
await page.goto('http://localhost:3000/view/notebook');
await page.screenshot({path:'./1.png'});

await browser.close();
};
surf();