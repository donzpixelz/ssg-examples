// app/eleventy_src/.eleventy.js
// Build from THIS folder; disable Nunjucks entirely; disable layouts globally.
module.exports = function(eleventyConfig) {
    // Do not inherit ignores from .gitignore (prevents "0 files" surprises)
    eleventyConfig.setUseGitIgnore(false);

    // Force NO layout everywhere (even if a file sets one)
    eleventyConfig.addGlobalData("eleventyComputed", { layout: () => false });

    // Copy css/js so they appear under /eleventy/… in the output
    eleventyConfig.addPassthroughCopy({ "css": "eleventy/css", "js": "eleventy/js" });

    return {
        pathPrefix: "/eleventy/",
        dir: { input: ".", includes: "_includes", data: "_data", output: "_site" },
        templateFormats: ["liquid","html","md"],  // no Nunjucks
        markdownTemplateEngine: "liquid",
        htmlTemplateEngine: "liquid"
    };
};
