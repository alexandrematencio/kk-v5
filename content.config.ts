import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    entrees: defineCollection({
      type: 'page',
      source: 'menu/entrees/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        price: z.number(),
        featured: z.boolean().default(false),
        spicy: z.number().min(0).max(3).default(0),
      })
    }),
    plats: defineCollection({
      type: 'page',
      source: 'menu/plats/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        price: z.number(),
        featured: z.boolean().default(false),
        spicy: z.number().min(0).max(3).default(0),
      })
    }),
    desserts: defineCollection({
      type: 'page',
      source: 'menu/desserts/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        price: z.number(),
        featured: z.boolean().default(false),
      })
    }),
    boissons: defineCollection({
      type: 'page',
      source: 'menu/boissons/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        price: z.number(),
      })
    }),
  }
})