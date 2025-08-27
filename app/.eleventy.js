// .eleventy.js
module.exports = function(eleventyConfig) {
  // Copy your source assets into the /eleventy/ path in the output
  eleventyConfig.addPassthroughCopy({
    "eleventy_src/css": "eleventy/css",
    "eleventy_src/js": "eleventy/js"
  });

  return {
    pathPrefix: "/eleventy/",
    dir: {
      input: "eleventy_src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };
};
