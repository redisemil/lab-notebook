import type { ComponentType } from 'react';

export type TopicMeta = {
  title: string;
  date: string;
  status?: string;
  tags?: string[];
  category?: string[];
  excerpt?: string;
};

type TopicModule = {
  default: ComponentType;
  meta: TopicMeta;
};

const modules = import.meta.glob<TopicModule>('../topics/*.mdx', { eager: true });

export type Topic = {
  slug: string;
  Component: ComponentType;
  meta: TopicMeta;
};

export const topics: Topic[] = Object.entries(modules)
  .map(([path, mod]) => {
    const slug = path.split('/').pop()!.replace(/\.mdx$/, '');
    return {
      slug,
      Component: mod.default,
      meta: mod.meta,
    };
  })
  .sort((a, b) => (a.meta.date < b.meta.date ? 1 : -1));

export function findTopic(slug: string): Topic | undefined {
  return topics.find((t) => t.slug === slug);
}

export type CategoryNode = {
  name: string;
  path: string[];
  topics: Topic[];
  children: CategoryNode[];
};

export function buildCategoryTree(all: Topic[]): CategoryNode[] {
  const root: CategoryNode = { name: '', path: [], topics: [], children: [] };

  for (const topic of all) {
    const path = topic.meta.category ?? ['Uncategorized'];
    let cursor = root;
    for (let i = 0; i < path.length; i++) {
      const segment = path[i];
      let child = cursor.children.find((c) => c.name === segment);
      if (!child) {
        child = { name: segment, path: path.slice(0, i + 1), topics: [], children: [] };
        cursor.children.push(child);
      }
      cursor = child;
    }
    cursor.topics.push(topic);
  }

  const sortNode = (node: CategoryNode) => {
    node.children.sort((a, b) => a.name.localeCompare(b.name));
    node.topics.sort((a, b) => a.meta.title.localeCompare(b.meta.title));
    node.children.forEach(sortNode);
  };
  root.children.forEach(sortNode);

  return root.children;
}

export function searchTopics(all: Topic[], query: string): Topic[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const tokens = q.split(/\s+/);

  return all
    .map((t) => {
      const haystack = [
        t.meta.title,
        ...(t.meta.tags ?? []),
        ...(t.meta.category ?? []),
        t.meta.excerpt ?? '',
      ]
        .join(' ')
        .toLowerCase();
      const score = tokens.reduce((acc, tok) => (haystack.includes(tok) ? acc + 1 : acc), 0);
      return { topic: t, score, hit: score === tokens.length };
    })
    .filter((r) => r.hit)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.topic);
}
