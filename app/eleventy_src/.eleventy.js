// app/eleventy_src/.eleventy.js
module.exports = function (eleventyConfig) {
    // Don’t let .gitignore hide templates
    eleventyConfig.setUseGitIgnore(false);

    // Make layout robust: if it's not a string or false, fall back to base.njk.
    eleventyConfig.addGlobalData("eleventyComputed", {
        layout: (data) => {
            if (data.layout === false) return false;
            if (typeof data.layout === "string") return data.layout;
            return "base.njk"; // safe default
        },
    });

    return {
        pathPrefix: "/eleventy/",
        dir: { input: ".", includes: "_includes", data: "_data" },
        templateFormats: ["njk", "liquid", "md", "html"],
        markdownTemplateEngine: "liquid",
        htmlTemplateEngine: "liquid",
    };
};
