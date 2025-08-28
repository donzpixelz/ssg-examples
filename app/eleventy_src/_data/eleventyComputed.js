// Coerce bad `layout` values to `false` so they don't crash the build.
module.exports = {
    layout: (data) =>
        typeof data.layout === "string" || data.layout === false ? data.layout : false,
};
