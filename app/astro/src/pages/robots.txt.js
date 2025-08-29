export function GET({ site }) {
    const origin = site?.toString() ?? '/astro/';
    const body =
        `User-agent: *
Allow: /astro/

Sitemap: ${site ? new URL('sitemap.xml', origin).toString() : '/astro/sitemap.xml'}
`;
    return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' }});
}
