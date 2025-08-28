// app/eleventy_src/.eleventy.js
// Harden layouts so bad values can't crash the build.
// Also set a sane default layout that points at your fixed base.njk.

module.exports = function(eleventyConfig) {
    // Don’t let .gitignore hide templates
    eleventyConfig.setUseGitIgnore(false);

    // Default layout for normal pages (must be a STRING)
    eleventyConfig.addGlobalData("layout", "base.njk");

    // If any page sets layout to a non-string (object/array), disable layout for that page
    eleventyConfig.addGlobalData("eleventyComputed", {
        layout: (data) =>
            typeof data.layout === "string" || data.layout === false ? data.layout : false
    });

    return {
        pathPrefix: "/eleventy/",
        dir: { input: ".", includes: "_includes", data: "_data" },
        // Allow all common formats; if CI limits formats, this still won't hurt.
        templateFormats: ["liquid","md","html","njk"],
        markdownTemplateEngine: "liquid",
        htmlTemplateEngine: "liquid"
    };
};
