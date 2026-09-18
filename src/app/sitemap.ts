import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// Single-page site: one canonical URL. Section anchors are not separate pages.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 }];
}
