import { defineConfig } from 'astro/config';
import tailwindcss from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwindcss()],
  // Static output - works on any host
  output: 'static',
});