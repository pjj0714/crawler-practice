const puppeteer = require("puppeteer");
const client = require("cheerio-httpcli");

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 500;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 1000);
    });
  });
}

async function run() {
  let count = 0;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const mainUrl = "https://www.instagram.com/explore/tags/codestates/";
  //   await page.setUserAgent(
  //     "Mozilla/5.0 (Linux; Android 8.0.0; Nexus 5 Build/LMY48B; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/43.0.2357.65 Mobile Safari/537.36"
  //   );
  let mainUrlStatus;
  await page.setRequestInterception(true);

  page.on("request", request => {
    const url = request.url();
    console.log("request url:", url);
    request.continue();
  });
  page.on("requestfailed", request => {
    count++;
    const url = request.url();
    console.log("request failed url:", url);
  });
  page.on("response", response => {
    count++;
    const request = response.request();
    const url = request.url();
    const status = response.status();
    console.log("response url:", url);
    if (url === mainUrl) {
      mainUrlStatus = status;
    }
  });
  console.log("status for main url:", mainUrlStatus);
  await page.goto(mainUrl);
  await autoScroll(page);
  const html = await page.content();
  console.log("asasddsdsdasdsdawqdq : ", count);
  await browser.close();
}

run();
