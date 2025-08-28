// .eleventy.js  (ROOT of the repo)
module.exports = function(eleventyConfig) {
  // Put CSS/JS in /eleventy/... in the output so links resolve with your pathPrefix
  eleventyConfig.addPassthroughCopy({
    "app/eleventy_src/css": "eleventy/css",
    "app/eleventy_src/js":  "eleventy/js"
  });

  return {
    pathPrefix: "/eleventy/",
    dir: {
      input:  "app/eleventy_src", // <-- build from where your CI logs show
      includes: "_includes",
      data:     "_data",
      output:  "_site"
    },
    // Avoid Nunjucks compile errors: only process Liquid/HTML/MD
    templateFormats: ["liquid","html","md"],
    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "liquid"
  };
};
