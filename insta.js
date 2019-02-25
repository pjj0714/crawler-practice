const puppeteer = require("puppeteer");

async function asd() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://www.instagram.com/k.kbeom/");

  await autoScroll(page);

  // const image = "main article img";

  // const imgaes = page.$$eval(image, el => console.log(el));

  // for (let img of imgaes) {
  //   crawler(img);
  // }

  // await browser.close();
  return;
}

async function crawler(img) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  try {
    await page.goto(img);
    await page.waitFor(5000);
    await page.close();
  } catch (e) {
    console.log(e.message);
  }

  return;
}

asd();

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve("asdf");
        }
      }, 100);
    });
  });
}
