const cron = require("cron");
const axios = require("axios");
const moment = require("moment");
require("dotenv").config();

const JSONSTORE_URL = `https://www.jsonstore.io/${process.env.JSON_STORE_KEY ||
  "41d64a309ce2822eab6c2311dd679722d33417490c48177d869307f29ccd474c"}`;

const CURRENT_FUCKS_GIVEN_KEY = "currentFucksGiven";
const FUCK_GIVEN_HISTORY_KEY = "fucksHistory";

const configOptions = {
  headers: {
    "Content-type": "application/json"
  }
};

console.log("Starting Cron Worker");

new cron.CronJob(
  "0 0 0 * * *",
  async () => {
    console.log("initiate updating fucks history");
    try {
      // get current fucks
      const getMostRecentFucksResponse = await axios.get(
        `${JSONSTORE_URL}/${CURRENT_FUCKS_GIVEN_KEY}`
      );
      const mostRecentFucksGivenAmount = getMostRecentFucksResponse.data.result
        ? getMostRecentFucksResponse.data.result.amount
        : 0;
      // add it to fucks history
      const getMostRecentFucksHistoryResponse = await axios.get(
        `${JSONSTORE_URL}/${FUCK_GIVEN_HISTORY_KEY}`
      );
      const mostRecentFucksHistoryResponse = getMostRecentFucksHistoryResponse
        .data.result
        ? getMostRecentFucksHistoryResponse.data.result.data
        : [];
      mostRecentFucksHistoryResponse.push({
        timeframe: moment()
          .subtract(1, "days")
          .format("MM/DD/YYYY"),
        amount: mostRecentFucksGivenAmount
      });
      await axios.put(
        `${JSONSTORE_URL}/${FUCK_GIVEN_HISTORY_KEY}`,
        {
          data: mostRecentFucksHistoryResponse
        },
        configOptions
      );
      // reset fucks
      await axios.post(
        `${JSONSTORE_URL}/${CURRENT_FUCKS_GIVEN_KEY}`,
        {
          amount: 0
        },
        configOptions
      );
    } catch (error) {
      console.error(error.message);
    }
  },
  null,
  true
);
