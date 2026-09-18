import { renderShareImage } from '@/lib/ogImage';

export const alt = 'Avyakt Garg — Software Engineer & ML/AI Infra';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return renderShareImage();
}
