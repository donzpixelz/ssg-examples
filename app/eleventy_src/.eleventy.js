// app/eleventy_src/.eleventy.js
// Minimal, stable config FROM this folder.
// Disables Nunjucks, ignores .gitignore, and disables layouts to avoid engine errors.
module.exports = function(eleventyConfig) {
    eleventyConfig.setUseGitIgnore(false);
    eleventyConfig.addGlobalData("eleventyComputed", { layout: () => false });

    return {
        dir: { input: ".", includes: "_includes", data: "_data", output: "_site" },
        templateFormats: ["liquid", "html", "md"], // no Nunjucks
        markdownTemplateEngine: "liquid",
        htmlTemplateEngine: "liquid",
        pathPrefix: "/eleventy/"
    };
};
