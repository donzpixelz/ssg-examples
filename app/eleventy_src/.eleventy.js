// app/eleventy_src/.eleventy.js
// Forward to the repo-root config so builds running from app/eleventy_src
// still use the SAME .eleventy.js you keep at the project root.
const path = require("path");
module.exports = require(path.resolve(__dirname, "../../.eleventy.js"));
