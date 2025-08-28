// app/eleventy_src/.eleventy.js
module.exports = function (eleventyConfig) {
    eleventyConfig.setUseGitIgnore(false);
    // make sure CSS/JS end up at /eleventy/css and /eleventy/js
    eleventyConfig.addPassthroughCopy({ css: "eleventy/css", js: "eleventy/js" });

    return {
        pathPrefix: "/eleventy/",
        dir: { input: ".", includes: "_includes", data: "_data" },
        // ensure Nunjucks layouts are enabled
        templateFormats: ["md", "njk", "html"],
        markdownTemplateEngine: "liquid",
        htmlTemplateEngine: "liquid"
    };
};
