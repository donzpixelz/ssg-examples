// .eleventy.js  (ROOT ONLY)
module.exports = function(eleventyConfig) {
  // Put built CSS/JS under /eleventy/... so links will resolve
  eleventyConfig.addPassthroughCopy({
    "eleventy_src/css": "eleventy/css",
    "eleventy_src/js":  "eleventy/js"
  });

  return {
    pathPrefix: "/eleventy/",
    dir: { input: "eleventy_src", includes: "_includes", data: "_data", output: "_site" }
  };
};
