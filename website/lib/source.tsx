import { loader } from 'fumadocs-core/source';
import type { InferPageType } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { statusBadgesPlugin } from 'fumadocs-core/source/status-badges';
import { docs, docsJa, docsZh } from 'fumadocs-mdx:collections/server';
import React from 'react';

import { Badge } from '@/components/ui/badge';

const renderProBadge = (status: string) => {
  if (status === 'pro') {
    return (
      <Badge
        variant='outline'
        className='ml-auto rounded-full bg-[#fee699] px-1.5 py-0.5 text-[11px] leading-none font-bold whitespace-nowrap text-[#231b08]'
      >
        PRO
      </Badge>
    );
  }
  return null;
};

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  plugins: [
    lucideIconsPlugin(),
    statusBadgesPlugin({
      renderBadge: renderProBadge,
    }),
  ],
});

export const sourceJa = loader({
  baseUrl: '/docs-ja',
  source: docsJa.toFumadocsSource(),
  plugins: [
    lucideIconsPlugin(),
    statusBadgesPlugin({
      renderBadge: renderProBadge,
    }),
  ],
});

export const sourceZh = loader({
  baseUrl: '/docs-zh',
  source: docsZh.toFumadocsSource(),
  plugins: [
    lucideIconsPlugin(),
    statusBadgesPlugin({
      renderBadge: renderProBadge,
    }),
  ],
});

export function getPageImage(page: InferPageType<typeof source>) {
  const segments = [...page.slugs, 'image.png'];

  return {
    segments,
    url: `/og/docs/${segments.join('/')}`,
  };
}

export async function getLLMText(page: InferPageType<typeof source>) {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title}

${processed}`;
}
