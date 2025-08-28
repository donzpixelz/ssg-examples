// app/eleventy_src/.eleventy.js
// Minimal, stable config from the folder CI is using.
module.exports = function(eleventyConfig) {
    // Do NOT inherit .gitignore (prevents "0 files" surprises)
    eleventyConfig.setUseGitIgnore(false);

    // Disable layouts globally (avoids layout engine compile errors)
    eleventyConfig.addGlobalData("eleventyComputed", { layout: () => false });

    return {
        // Build from THIS folder, output to _site
        dir: { input: ".", output: "_site" },

        // Only process Liquid/HTML/Markdown (no Nunjucks)
        templateFormats: ["liquid", "html", "md"],
        markdownTemplateEngine: "liquid",
        htmlTemplateEngine: "liquid",

        // Keep your existing URL base
        pathPrefix: "/eleventy/",
    };
};
