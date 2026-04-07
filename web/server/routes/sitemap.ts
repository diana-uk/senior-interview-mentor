import { Router } from 'express';

const sitemapRouter = Router();

// Problem IDs are loaded at startup from shared data
// Since server can't import frontend TS modules directly, we maintain a lightweight list
const PROBLEM_IDS = [
  // HashMap (7)
  'hm-1', 'hm-2', 'hm-3', 'hm-4', 'hm-5', 'hm-6', 'hm-7',
  // Sliding Window (6)
  'sw-1', 'sw-2', 'sw-3', 'sw-4', 'sw-5', 'sw-6',
  // Two Pointers (4)
  'tp-1', 'tp-2', 'tp-3', 'tp-4',
  // Binary Search (7)
  'bs-1', 'bs-2', 'bs-3', 'bs-4', 'bs-5', 'bs-6', 'bs-7',
  // Array (2)
  'ar-1', 'ar-2',
  // String (4)
  'st-1', 'st-2', 'st-3', 'st-4',
  // Linked List (10)
  'll-1', 'll-2', 'll-3', 'll-4', 'll-5', 'll-6', 'll-7', 'll-8', 'll-9', 'll-10',
  // Matrix (4)
  'mx-1', 'mx-2', 'mx-3', 'mx-4',
  // Interval (6)
  'iv-1', 'iv-2', 'iv-3', 'iv-4', 'iv-5', 'iv-6',
  // Stack (7)
  'sk-1', 'sk-2', 'sk-3', 'sk-4', 'sk-5', 'sk-6', 'sk-7',
  // Bit Manipulation (7)
  'bm-1', 'bm-2', 'bm-3', 'bm-4', 'bm-5', 'bm-6', 'bm-7',
  // Trees (15)
  'tr-1', 'tr-2', 'tr-3', 'tr-4', 'tr-5', 'tr-6', 'tr-7', 'tr-8', 'tr-9', 'tr-10', 'tr-11', 'tr-12', 'tr-13', 'tr-14', 'tr-15',
  // Trie (3)
  'tri-1', 'tri-2', 'tri-3',
  // Dynamic Programming (23)
  'dp-1', 'dp-2', 'dp-3', 'dp-4', 'dp-5', 'dp-6', 'dp-7', 'dp-8', 'dp-9', 'dp-10',
  'dp-11', 'dp-12', 'dp-13', 'dp-14', 'dp-15', 'dp-16', 'dp-17', 'dp-18', 'dp-19', 'dp-20',
  'dp-21', 'dp-22', 'dp-23',
  // Graphs (13)
  'gr-1', 'gr-2', 'gr-3', 'gr-4', 'gr-5', 'gr-6', 'gr-7', 'gr-8', 'gr-9', 'gr-10', 'gr-11', 'gr-12', 'gr-13',
  // Heap (7)
  'hp-1', 'hp-2', 'hp-3', 'hp-4', 'hp-5', 'hp-6', 'hp-7',
  // Backtracking (8)
  'bt-1', 'bt-2', 'bt-3', 'bt-4', 'bt-5', 'bt-6', 'bt-7', 'bt-8',
  // Greedy (6)
  'gy-1', 'gy-2', 'gy-3', 'gy-4', 'gy-5', 'gy-6',
  // Advanced Graphs (6)
  'ag-1', 'ag-2', 'ag-3', 'ag-4', 'ag-5', 'ag-6',
  // Math & Geometry (5)
  'mg-1', 'mg-2', 'mg-3', 'mg-4', 'mg-5',
];

const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/behavioral', priority: '0.6', changefreq: 'monthly' },
  { path: '/achievements', priority: '0.4', changefreq: 'monthly' },
  { path: '/problems', priority: '0.7', changefreq: 'weekly' },
  { path: '/stats', priority: '0.4', changefreq: 'monthly' },
];

const BASE_URL = process.env.APP_URL || 'https://seniormentor.dev';

/** Build the sitemap XML string. Exported for unit testing. */
export function buildSitemap(baseUrl: string): string {
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static pages
  for (const page of STATIC_PAGES) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // Problem pages
  for (const id of PROBLEM_IDS) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/problems/${id}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;
  return xml;
}

sitemapRouter.get('/sitemap.xml', (_req, res) => {
  res.header('Content-Type', 'application/xml');
  res.header('Cache-Control', 'public, max-age=86400'); // 24h cache
  res.send(buildSitemap(BASE_URL));
});

export default sitemapRouter;
