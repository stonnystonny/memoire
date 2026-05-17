export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: ['@pinia/nuxt'],

  css: [
    'vfonts/Lato.css',
    'vfonts/FiraCode.css',
    '~/assets/css/main.css',
  ],

  app: {
    head: {
      title: 'Mémoire — личный дневник',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Личный дневник с заметками, фото и календарём' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📔</text></svg>' },
      ],
    },
  },

  ssr: false,
})
