// .eleventy.js  (ROOT ONLY)
module.exports = function(eleventyConfig) {
  // Copy your assets into where the site will look for them (respects your pathPrefix)
  eleventyConfig.addPassthroughCopy({
    "eleventy_src/css": "eleventy/css",
    "eleventy_src/js":  "eleventy/js"
  });

  return {
    pathPrefix: "/eleventy/",
    dir: { input: "eleventy_src", includes: "_includes", data: "_data", output: "_site" }
  };
};
