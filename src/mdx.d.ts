declare module '*.mdx' {
  import type { ComponentType } from 'react';

  export const meta: {
    title: string;
    date: string;
    tags?: string[];
    category?: string[];
    excerpt?: string;
  };

  const Component: ComponentType;
  export default Component;
}
