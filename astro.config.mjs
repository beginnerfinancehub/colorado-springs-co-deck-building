import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://coloradospringsdeckbuilding.com',
  // Network-wide convention (matches sites #1-#3): canonical URLs end with a
  // slash (Astro 'directory' build format). One trailing-slash rule across
  // every LocalSiteLeads site.
  trailingSlash: 'always',
  integrations: [sitemap()],
});
