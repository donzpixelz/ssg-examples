// /.eleventy.js (repo root)
module.exports = function(eleventyConfig) {
  return {
    pathPrefix: "/eleventy/",
    dir: {
      input: "app/eleventy_src",  // where your content/layouts live now
      includes: "_includes",
      output: "app/eleventy"      // <-- BUILT HTML goes here (your deploy already uses this)
    }
  };
};
