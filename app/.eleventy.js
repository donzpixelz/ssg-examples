// .eleventy.js — minimal: keep your pathPrefix, just copy CSS/JS
module.exports = function(eleventyConfig) {
  // Copy assets from your source folders into the built site
  eleventyConfig.addPassthroughCopy({ "eleventy_src/css": "css", "eleventy_src/js": "js" });

  return { pathPrefix: "/eleventy/" };
};
