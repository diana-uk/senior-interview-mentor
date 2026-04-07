import { describe, it, expect } from 'vitest';
import { buildSitemap } from '../../../server/routes/sitemap';

const BASE = 'https://test.example.com';

// ─── XML Structure ───────────────────────────────────────────────────────────

describe('buildSitemap — XML structure', () => {
  it('starts with XML declaration', () => {
    expect(buildSitemap(BASE)).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  });

  it('includes sitemap namespace in urlset', () => {
    expect(buildSitemap(BASE)).toContain(
      'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    );
  });

  it('closes urlset tag', () => {
    expect(buildSitemap(BASE)).toContain('</urlset>');
  });

  it('uses the provided base URL', () => {
    const xml = buildSitemap('https://custom.dev');
    expect(xml).toContain('<loc>https://custom.dev/</loc>');
    expect(xml).not.toContain('<loc>https://test.example.com/</loc>');
  });

  it('includes a lastmod date in YYYY-MM-DD format', () => {
    expect(buildSitemap(BASE)).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
  });
});

// ─── Static Pages ────────────────────────────────────────────────────────────

describe('buildSitemap — static pages', () => {
  it('includes homepage with priority 1.0', () => {
    const xml = buildSitemap(BASE);
    expect(xml).toContain(`<loc>${BASE}/</loc>`);
    expect(xml).toContain('<priority>1.0</priority>');
  });

  it('includes /behavioral page', () => {
    expect(buildSitemap(BASE)).toContain(`<loc>${BASE}/behavioral</loc>`);
  });

  it('includes /achievements page', () => {
    expect(buildSitemap(BASE)).toContain(`<loc>${BASE}/achievements</loc>`);
  });

  it('includes /problems page', () => {
    expect(buildSitemap(BASE)).toContain(`<loc>${BASE}/problems</loc>`);
  });

  it('includes /stats page', () => {
    expect(buildSitemap(BASE)).toContain(`<loc>${BASE}/stats</loc>`);
  });

  it('homepage uses weekly changefreq', () => {
    const xml = buildSitemap(BASE);
    // Homepage block contains loc then changefreq
    const homepageBlock = xml.substring(xml.indexOf(`<loc>${BASE}/</loc>`), xml.indexOf(`<loc>${BASE}/behavioral</loc>`));
    expect(homepageBlock).toContain('<changefreq>weekly</changefreq>');
  });
});

// ─── Problem Pages ───────────────────────────────────────────────────────────

describe('buildSitemap — problem pages', () => {
  it('includes first HashMap problem (hm-1)', () => {
    expect(buildSitemap(BASE)).toContain(`<loc>${BASE}/problems/hm-1</loc>`);
  });

  it('includes last Math problem (mg-5)', () => {
    expect(buildSitemap(BASE)).toContain(`<loc>${BASE}/problems/mg-5</loc>`);
  });

  it('includes DP problems', () => {
    expect(buildSitemap(BASE)).toContain(`<loc>${BASE}/problems/dp-1</loc>`);
    expect(buildSitemap(BASE)).toContain(`<loc>${BASE}/problems/dp-23</loc>`);
  });

  it('gives all problem pages priority 0.8', () => {
    const xml = buildSitemap(BASE);
    const priority08Count = (xml.match(/<priority>0\.8<\/priority>/g) ?? []).length;
    // 150 problems expected
    expect(priority08Count).toBeGreaterThanOrEqual(150);
  });

  it('gives problem pages monthly changefreq', () => {
    const xml = buildSitemap(BASE);
    const problemSection = xml.split(`<loc>${BASE}/problems/`)[1];
    expect(problemSection).toContain('<changefreq>monthly</changefreq>');
  });

  it('does not include problem IDs in static page section', () => {
    const xml = buildSitemap(BASE);
    // The static /problems page should appear before individual problem pages
    const staticProblemsIdx = xml.indexOf(`<loc>${BASE}/problems</loc>`);
    const firstProblemIdx = xml.indexOf(`<loc>${BASE}/problems/hm-1</loc>`);
    expect(staticProblemsIdx).toBeLessThan(firstProblemIdx);
  });
});
