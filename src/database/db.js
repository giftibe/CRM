const mongoose = require("mongoose");
const colors = require("colors");
const { MESSAGES } = require("../config/constant.config");

function database() {
  mongoose
    .set("strictQuery", true)
    .connect(process.env.DATABASE_URI, {
      //userCreateIndex: true,
      //useNewUrlParser: true,
      //userUnifiedTopology: true,
    })
    .then(() => {
      console.log(`${"✔✔✔".green}`, MESSAGES.DATABASE.CONNECTED.yellow);
    })
    .catch((err) => {
      console.log(MESSAGES.DATABASE.ERROR.red + err);
    });
}

module.exports = database;
