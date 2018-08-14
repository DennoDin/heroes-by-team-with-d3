const path = require("path");

module.exports = {
  entry: {
    home: "./script.js",
  },
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "bundle.js",
  }
}