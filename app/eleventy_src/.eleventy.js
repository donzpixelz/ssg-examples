// app/eleventy_src/.eleventy.js
// Ignore .gitignore rules and only use simple engines.
// Build from THIS folder to _site.
module.exports = function(eleventyConfig) {
    eleventyConfig.setUseGitIgnore(false);
    return {
        dir: { input: ".", output: "_site" },
        templateFormats: ["md","html","liquid"],
        markdownTemplateEngine: "liquid",
        htmlTemplateEngine: "liquid"
    };
};
