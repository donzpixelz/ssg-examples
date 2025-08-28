// app/eleventy_src/.eleventy.js
module.exports = function (eleventyConfig) {
    eleventyConfig.setUseGitIgnore(false); // don't accidentally hide templates
    eleventyConfig.addPassthroughCopy({ css: "eleventy/css", js: "eleventy/js" });

    return {
        pathPrefix: "/eleventy/",
        dir: { input: ".", includes: "_includes", data: "_data" }
    };
};
