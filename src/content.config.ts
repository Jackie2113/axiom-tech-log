import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const tech = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/tech" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.string(),
    maturity: z.string().optional(),
    summary: z.string(),
    architectureImage: z.string().optional(),
    architectureCaption: z.string().optional(),
    youtubeId: z.string().optional(),
    references: z.array(
      z.object({
        title: z.string(),
        url: z.string().url(),
      })
    ).optional(),
  }),
});

export const collections = { tech };