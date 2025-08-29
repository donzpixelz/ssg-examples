export async function GET({ site }) {
    const posts = (await import.meta.glob('./posts/*.md', { eager: true }))
    // Each module is { frontmatter, url }
    const items = Object.values(posts)
        .map(m => m)
        .sort((a, b) => new Date(b.frontmatter.date ?? 0) - new Date(a.frontmatter.date ?? 0))
        .slice(0, 20);

    const origin = site?.toString() ?? 'http://localhost/';
    const xml =
        `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>Astro Example</title>
  <link>${origin}</link>
  <description>Recent posts from Astro Example</description>
  ${items.map(p => `
    <item>
      <title>${escapeXml(p.frontmatter.title ?? 'Untitled')}</title>
      <link>${new URL(p.url, origin).toString()}</link>
      ${p.frontmatter.description || p.frontmatter.summary ? `<description>${escapeXml(p.frontmatter.description ?? p.frontmatter.summary)}</description>` : ''}
      ${p.frontmatter.date ? `<pubDate>${new Date(p.frontmatter.date).toUTCString()}</pubDate>` : ''}
      <guid>${new URL(p.url, origin).toString()}</guid>
    </item>
  `).join('')}
</channel>
</rss>`;

    return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' }});
}

function escapeXml(s=''){ return String(s).replace(/[<>&'"]/g, ch => ({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[ch])); }
