import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const legal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/legal' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    draftNotice: z.string(),          // shown as a visible banner; publication blocker wording
    sections: z.array(z.object({
      heading: z.string(),
      fields: z.array(z.object({ label: z.string(), value: z.string().nullable() })),
      prose: z.string().optional(),
    })),
  }),
});
export const collections = { legal };
