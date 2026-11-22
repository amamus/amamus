import type { APIRoute } from 'astro';
import { absoluteUrl } from '../utils/paths';

export const GET: APIRoute = () => {
  const pages = ['/', '/impressum/', '/datenschutz/'];
  const lastmod = new Date().toISOString().slice(0, 10);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages
    .map((p) => `  <url><loc>${absoluteUrl(p)}</loc><lastmod>${lastmod}</lastmod></url>`)
    .join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
