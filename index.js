const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto("https://food.grab.com/sg/en/", {
      waitUntil: "networkidle2",
    });

    let data = new Array(); // to store the data

    page.on("response", async (response) => {
      try {
        // To capture all requests
        const url = response.url();

        //  put the required URL which contains the data
        if (
          url.includes(
            "https://portal.grab.com/foodweb/v2/search" ||
              "https://portal.grab.com/foodweb/v2/category"
          )
        ) {
          // If URL matches
          const firstResponse = await page.waitForResponse(url);

          // converting data into json data

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
          console.table(data);
          async function clickElement() {
            await page.click("button.ant-btn");
            console.log(await page.title());
          }
          clickElement();
        }
        fs.writeFile("./restaurants.json", JSON.stringify(data), (err) => {
          if (err) {
            console.error(err);
            return;
          }
          // console.log("Great Success");
        });
      } catch (error) {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
})();
