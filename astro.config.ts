import path from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

import { defineConfig, fontProviders } from 'astro/config';

import { unified } from '@astrojs/markdown-remark';

import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import icon from 'astro-icon';
import type { AstroIntegration } from 'astro';

import astrowind from './vendor/integration';

import { readingTimeRemarkPlugin, responsiveTablesRehypePlugin } from './src/utils/frontmatter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Sitemap : seulement les pages publiques indexables. Les fiches de division restent hors
// sitemap tant que leur contenu commercial n'est pas validé (et toujours en prévisualisation).
const isProduction = process.env.RESTUP_MODE === 'production';
const catalogue = JSON.parse(readFileSync(path.join(__dirname, 'src/data/catalogue.json'), 'utf8')) as {
  divisions: Array<{ path: string; contentStatus: string }>;
};
const notInSitemap = [
  '/merci',
  '/mentions-legales',
  '/confidentialite',
  '/cookies',
  '/404',
  ...catalogue.divisions.filter((d) => !isProduction || d.contentStatus !== 'approved').map((d) => d.path),
];

const hasExternalScripts = false;
const whenExternalScripts = (items: (() => AstroIntegration) | (() => AstroIntegration)[] = []) =>
  hasExternalScripts ? (Array.isArray(items) ? items.map((item) => item()) : [items()]) : [];

export default defineConfig({
  output: 'static',
  build: { format: 'file' },

  // Prefetch links as they enter the viewport for snappier navigations
  // (works together with <ClientRouter />, which enables prefetch by default).
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },

  // Native Fonts API: self-hosts + subsets + preloads Inter and generates
  // metric-adjusted fallbacks. Injected via <Font /> in Layout.astro and
  // consumed through the `--font-inter` CSS variable in CustomStyles.astro.
  fonts: [
    // Polices hébergées dans le dépôt (licence SIL OFL, voir src/assets/fonts) : aucun appel externe au build.
    {
      provider: fontProviders.local(),
      name: 'Inter',
      cssVariable: '--font-inter',
      fallbacks: ['sans-serif'],
      options: {
        variants: [{ src: ['./src/assets/fonts/inter-latin-wght-normal.woff2'], weight: '100 900', style: 'normal' }],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Archivo',
      cssVariable: '--font-archivo',
      fallbacks: ['sans-serif'],
      options: {
        variants: [
          { src: ['./src/assets/fonts/archivo-latin-700-normal.woff2'], weight: '700', style: 'normal' },
          { src: ['./src/assets/fonts/archivo-latin-700-italic.woff2'], weight: '700', style: 'italic' },
          { src: ['./src/assets/fonts/archivo-latin-800-normal.woff2'], weight: '800', style: 'normal' },
          { src: ['./src/assets/fonts/archivo-latin-800-italic.woff2'], weight: '800', style: 'italic' },
          { src: ['./src/assets/fonts/archivo-latin-900-normal.woff2'], weight: '900', style: 'normal' },
          { src: ['./src/assets/fonts/archivo-latin-900-italic.woff2'], weight: '900', style: 'italic' },
        ],
      },
    },
  ],

  integrations: [
    sitemap({ filter: (page) => !notInSitemap.includes(new URL(page).pathname.replace(/\.html$/, '')) }),
    mdx(),
    icon({
      // Local SVG icons (used as <Icon name="file-name" />) live next to the other assets.
      iconDir: 'src/assets/icons',
      include: {
        tabler: ['*'],
        'flat-color-icons': [
          'template',
          'gallery',
          'approval',
          'document',
          'advertising',
          'currency-exchange',
          'voice-presentation',
          'business-contact',
          'database',
        ],
      },
    }),

    ...whenExternalScripts(() =>
      partytown({
        config: { forward: ['dataLayer.push'] },
      })
    ),

    astrowind({
      config: './src/config.yaml',
    }),
  ],

  image: {
    // Astro's default Sharp service handles local images.
    //
    // Most remote CDN images (Unsplash, Cloudinary, Imgix…) are routed by
    // src/components/common/Image.astro through `unpic`, which rewrites the
    // URL with CDN-side query parameters and serves it straight from the
    // provider — Astro never downloads it, so they don't need to be listed.
    //
    // `domains` only matters for remote URLs that fall through to Astro's
    // native <Image /> (i.e. providers Unpic can't detect, like Pixabay).
    // Listed entries are authorized to be processed by Sharp.
    // Unsplash is listed so post covers can be rendered as real 1200×626 Open Graph images.
    domains: ['cdn.pixabay.com', 'images.unsplash.com'],

    // Emit responsive styles for the native <Image layout=…> used by
    // src/components/common/Image.astro (local images). Utility classes on
    // each usage still win, since these styles use low-specificity selectors.
    responsiveStyles: true,
  },

  markdown: {
    processor: unified({
      remarkPlugins: [readingTimeRemarkPlugin],
      rehypePlugins: [responsiveTablesRehypePlugin],
    }),
    shikiConfig: {
      // Code blocks follow the site theme; see the `.astro-code` rules in tailwind.css.
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },
  },
});
