module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "eleventy_src/css": "css", "eleventy_src/js": "js" });
  return {
    dir: { input: "eleventy_src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "liquid",
    templateFormats: ["liquid","md","html"]
  };
};
