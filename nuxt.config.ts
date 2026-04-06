// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "@nuxt/eslint", "@nuxt/fonts"],
  eslint: {
    config: {
      stylistic: {
        semi: true,
        quotes: "double",
        commaDangle: "always-multiline",
        indent: "tab",
      },
    },
  },
  app: {
    head: {
      title: "Cher's Closet",
      meta: [
        { name: "description", content: "A clothing store for everyone." },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
      // link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },
});