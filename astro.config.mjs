// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
    site: 'https://ryandielhenn.github.io',
    base: '/',
    markdown: {
        // Disable Shiki; it injects inline styles that override the blog's
        // Everforest code-block CSS. None of the fences use a language anyway.
        syntaxHighlight: false,
    },
    vite: {
        plugins: [tailwindcss()],
    },
});
