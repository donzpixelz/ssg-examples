// .eleventy.js (equivalent, more extensible)
module.exports = function(eleventyConfig) {
  return {
    pathPrefix: "/eleventy/",
    // dir: { input: ".", includes: "_includes", output: "_site" }, // defaults
  };
};
