import { defineConfig } from 'astro/config';

export default defineConfig({
  // Your Astro section is served at /astro/
  base: '/astro/',

  // Set this to your real origin so canonical URLs / RSS / sitemap are absolute.
  // Example for your EC2 IP; change later if you get a domain.
  site: 'http://18.220.33.0/astro/',

  // Shiki syntax highlighting (light/dark themes)
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      wrap: true, // soft-wrap long code lines
    },
  },
});
