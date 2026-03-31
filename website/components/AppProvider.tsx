'use client';

import { RootProvider } from 'fumadocs-ui/provider/next';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { DocsSearchDialog } from '@/components/DocsSearchDialog';
import { getLanguageCodeFromPathname, localeItems } from '@/lib/i18n';
import { BASE_PATH } from '@/lib/site';

export function AppProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const locale = getLanguageCodeFromPathname(pathname);

  return (
    <RootProvider
      search={{
        SearchDialog: DocsSearchDialog,
        options: { api: `${BASE_PATH}/api/search` },
      }}
      i18n={{ locale, locales: localeItems }}
    >
      {children}
    </RootProvider>
  );
}
