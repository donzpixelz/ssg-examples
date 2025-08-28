// app/eleventy_src/.eleventy.js
// Guard against invalid `layout` values and keep your prefix.
module.exports = function(eleventyConfig) {
    // Don’t let .gitignore hide templates
    eleventyConfig.setUseGitIgnore(false);

    // If a template sets `layout:` to an object/array, disable layout for that file
    eleventyConfig.addGlobalData("eleventyComputed", {
        layout: (data) => (typeof data.layout === "string" || data.layout === false) ? data.layout : false
    });

    return {
        pathPrefix: "/eleventy/",
        dir: { input: ".", includes: "_includes", data: "_data" },
        templateFormats: ["liquid","md","html","njk"],
        markdownTemplateEngine: "liquid",
        htmlTemplateEngine: "liquid"
    };
};
