export async function GET({ site }) {
    const origin = site?.toString() ?? 'http://localhost/astro/';

    // Known static pages in this demo
    const staticPaths = ['','about/','contact/','posts/','tags/'];

    // Posts
    const postMods = await import.meta.glob('./posts/*.md', { eager: true });
    const postUrls = Object.values(postMods).map(m => m.url);

    const urls = [...staticPaths, ...postUrls];
    const xml =
        `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `<url><loc>${new URL(u, origin).toString()}</loc></url>`).join('\n')}
</urlset>`;

    return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' }});
}
