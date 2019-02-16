const puppeteer = require("puppeteer");
const api = require('./API')
var googleMapsClient = require("@google/maps").createClient({
  key: api
});

async function crawler() {
  for (let pages = 1; pages < 12; pages++) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(
      `https://store.naver.com/restaurants/list?filterId=r08&page=${pages}&query=%EC%B1%84%EC%8B%9D`
    );

    try {
      linkList = await page.$$eval(
        "li.list_item.type_restaurant a.name",
        links => links.map(link => link.getAttribute("href"))
      );

      for (let link of linkList) {
        await crawlerDetail(link);
      }

      await browser.close();
    } catch (err) {
      console.log("lingkErr : ", err.message);
    }
  }

  return;
}
async function crawlerDetail(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  let res = {};
  await page.waitFor(700);

  try {
    const titleSelector = ".biz_name_area > .name";
    res.name = await page.$eval(titleSelector, title => title.innerHTML);
  } catch (err) {
    console.log("titleNameErr : ", err.message);
  }
  try {
    const imagesSelector =
      ".flick_content._page.eg-flick-panel > .thumb_area > div.thumb > img";
    const imageSelec =
      "div.flick_content._page.eg-flick-panel > .thumb_area._item > a.thumb > img";
    res.images = await page.$$eval(imageSelec, list => {
      list = list.slice(0, 5);
      return list.map(el => el.getAttribute("src"));
    });
  } catch (err) {
    console.log("iamgeErr : ", err.message);
  }
  try {
    const contactSelector = ".list_item.list_item_biztel > div.txt";
    // await page.waitForSelector(contactSelector, waitOption);
    res.phoneNumber = await page.$eval(contactSelector, div => div.innerHTML);
  } catch (err) {
    res.phoneNumber = "";
    console.log("phoneNumberErr: ", err.message);
  }
  try {
    const addressesSelector =
      ".list_item.list_item_address > div.txt span.addr";
    // await page.waitForSelector(addressesSelector, waitOption);
    const addresses = await page.$$eval(addressesSelector, addrs =>
      addrs.map(addr => addr.innerHTML)
    );
    res.addresses = addresses.slice(0, 2);

    await googleMapsClient.geocode({ address: addresses[0] }, async function(
      err,
      response
    ) {
      if (!err) {
        location = await response.json.results[0].geometry.location;
      }
    });

    res.latitude = location.lat;
    res.longitude = location.lng;
  } catch (error) {
    res.addresses = "";
    console.error("addressErr : ", error.message);
  }
  try {
    const menuNamesSelector =
      ".list_item.list_item_menu .list_menu_inner .name";
    // await page.waitForSelector(pricesSelector, waitOption);
    // await page.waitForSelector(menuNamesSelector, waitOption);
    const menuNames = await page.$$eval(menuNamesSelector, list =>
      list.map(item => item.innerHTML)
    );
    res.menu = menuNames;
  } catch (error) {
    res.menu = "";
    console.error("menuErr : ", error.message);
  }
  await browser.close();
  console.log(res);
  return res;
}
crawler();
