const cron = require("cron");
const axios = require("axios");
const moment = require("moment");
require("dotenv").config();

const MYJSON_URL = `https://api.myjson.com/bins/${process.env
  .VUE_APP_MY_JSON_KEY || "9qmh8"}`;

const configOptions = {
  headers: {
    "Content-type": "application/json"
  }
};

console.log("Starting Cron Worker");

const getFucksData = async () => {
  const response = await axios.get(MYJSON_URL, configOptions);
  return response.data;
};

const setFucksData = async input => {
  const response = await axios.put(MYJSON_URL, input, configOptions);
  return response.data;
};

new cron.CronJob(
  "0 0 0 * * *",
  async () => {
    console.log("initiate updating fucks history");
    try {
      // get current fucks
      const fucksData = await getFucksData();
      const mostRecentFucksGivenAmount = fucksData.currentFucksGiven
        ? fucksData.currentFucksGiven.amount
        : 0;
      // add it to fucks history
      const mostRecentFucksHistoryData = fucksData.fucksHistory
        ? fucksData.fucksHistory.data
        : [];
      mostRecentFucksHistoryData.push({
        timeframe: moment()
          .subtract(1, "days")
          .format("MM/DD/YYYY"),
        amount: mostRecentFucksGivenAmount
      });
      await setFucksData({
        currentFucksGiven: {
          amount: 0
        },
        fucksHistory: {
          data: mostRecentFucksHistoryData
        }
      });
    } catch (error) {
      console.error(error.message);
    }
  },
  null,
  true
);
