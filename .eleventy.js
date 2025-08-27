// /.eleventy.js (repo root)
module.exports = function(eleventyConfig) {
  return {
    pathPrefix: "/eleventy/",
    dir: {
      input: "app/eleventy",
      includes: "_includes",
      output: "app/eleventy/_site"
    }
  };
};
