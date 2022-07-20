const puppeteer = require("puppeteer");
const fs = require("fs");

const scrap = async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    const navigationPromise = page.waitForNavigation({
      waitUntil: "networkidle2",
    });

    await page.goto("https://food.grab.com/sg/en/", {
      waitUntil: "networkidle2",
    });

    await navigationPromise;

    let data = new Array(); // to store the data
    const urlData = [];

    page.on("response", async (response) => {
      try {
        // capture all the url requests
        const url = response.url();

        urlData.push(url);

        await page.waitForSelector(".ant-btn");
        await page.click(
          "#page-content > div > div > div > div > div > button"
        );

        //  get the required url having the lat long
        if (
          url.includes(
            "https://portal.grab.com/foodweb/v2/search" ||
              "https://portal.grab.com/foodweb/v2/category"
          )
        ) {
          // if URL matches :
          const firstResponse = await page.waitForResponse(url);

          // convert data into json
          const jsonResponse = await firstResponse.json();

          const restaurentsData = jsonResponse.searchResult.searchMerchants;

          restaurentsData.forEach((e) => {
            let obj = {
              name: e.address.name,
              latitude: e.latlng.latitude,
              longitude: e.latlng.longitude,
            };

            data.push(obj);
          });

          // console.table(data);
          // gett the data into a json file
          fs.writeFile("./restaurants.json", JSON.stringify(data), (err) => {
            if (err) {
              console.log(error);
              return;
            }
            // console.log("Great Success")
          });
        }
      } catch (error) {
        console.log(error, "in first try catch block");
      }
    });
  } catch (error) {
    console.log(error);
  }
};
scrap();
