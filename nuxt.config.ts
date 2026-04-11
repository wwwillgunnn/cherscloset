// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxtjs/supabase",
  ],
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
  runtimeConfig: {
    pixazoApiKey: "",
    removeBgApiKey: "",
    replicateApiToken: "",
    public: {},
  },
  supabase: {
    redirectOptions: {
      login: "/login",
      callback: "/confirm",
      include: undefined,
      exclude: [],
      saveRedirectToCookie: false,
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
