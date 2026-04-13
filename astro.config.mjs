// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";

import icon from "astro-icon";

const isPreview = process.env.DATO_PREVIEW === "true";

const adapter = process.env.VERCEL === "1" ? vercel() : node({ mode: "standalone" });

// https://astro.build/config
export default defineConfig({
    output: isPreview ? "server" : "static",
    site: "https://zauberbergproductions.com",
    integrations: [sitemap(), icon()],
    vite: {
        plugins: [tailwindcss()],
    },
    adapter,
});
