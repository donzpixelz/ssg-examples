// app/eleventy_src/.eleventy.js
module.exports = function (eleventyConfig) {
    // Don’t let .gitignore hide templates in CI
    eleventyConfig.setUseGitIgnore(false);

    // Copy assets so the CSS/JS exist at /eleventy/css and /eleventy/js
    eleventyConfig.addPassthroughCopy({ "css": "eleventy/css", "js": "eleventy/js" });

    // If a page has a broken `layout:` (object/array), don’t crash—render without layout.
    eleventyConfig.addGlobalData("eleventyComputed", {
        layout: (data) => {
            if (data.layout === false) return false;
            return typeof data.layout === "string" ? data.layout : "base.njk";
        },
    });

    return {
        pathPrefix: "/eleventy/",
        dir: { input: ".", includes: "_includes", data: "_data" },
        templateFormats: ["md", "njk", "html", "liquid"],
        markdownTemplateEngine: "liquid",
        htmlTemplateEngine: "liquid",
    };
};
