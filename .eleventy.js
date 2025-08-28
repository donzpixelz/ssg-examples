// .eleventy.js (ROOT)
// Forward to the real config inside app/eleventy_src so both CI and local use the SAME settings.
module.exports = require("./app/eleventy_src/.eleventy.js");
