import { useParams, Link } from 'react-router-dom';
import { findTopic } from '../lib/topics';
import Breadcrumb from './Breadcrumb';

export default function TopicPage() {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return null;

  const topic = findTopic(slug);
  if (!topic) {
    return (
      <div>
        <h1 className="text-2xl font-medium mb-4">Not found</h1>
        <Link to="/" className="text-sm text-slate-500 hover:text-slate-900">
          ← back to index
        </Link>
      </div>
    );
  }

  const { Component, meta } = topic;
  return (
    <article className="prose prose-slate max-w-none prose-headings:font-medium prose-h1:text-3xl prose-h2:text-xl prose-h2:mt-12 prose-h3:text-base">
      <div className="mb-8 not-prose">
        <Breadcrumb category={meta.category} />
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1 mt-3">
          {meta.date}
        </p>
        {meta.tags && meta.tags.length > 0 && (
          <p className="text-xs text-slate-500">{meta.tags.join(' · ')}</p>
        )}
      </div>
      <Component />
    </article>
  );
}
