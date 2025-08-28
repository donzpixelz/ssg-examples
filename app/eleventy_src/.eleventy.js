// app/eleventy_src/.eleventy.js
// Build from *this* folder, keep your /eleventy/ prefix,
// copy css/js, and avoid Nunjucks entirely.
module.exports = function(eleventyConfig) {
    eleventyConfig.addPassthroughCopy({ "css": "eleventy/css", "js": "eleventy/js" });
    return {
        pathPrefix: "/eleventy/",
        dir: { input: ".", includes: "_includes", data: "_data", output: "_site" },
        templateFormats: ["liquid","html","md"],
        markdownTemplateEngine: "liquid",
        htmlTemplateEngine: "liquid"
    };
};
