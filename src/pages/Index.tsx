import { Link } from 'react-router-dom';
import { topics, buildCategoryTree, type CategoryNode, type Topic } from '../lib/topics';

export default function IndexPage() {
  const tree = buildCategoryTree(topics);
  const recent = topics.slice(0, 5);

  return (
    <div>
      <h1 className="text-3xl font-medium mb-3">Notebook</h1>
      <p className="text-slate-600 mb-2 leading-relaxed">
        Things I'm trying to understand, written down as I work them out.
      </p>
      <p className="text-sm text-slate-500 mb-12 leading-relaxed">
        Each page is a single concept I bumped into and didn't grasp until I wrote it down. Pages don't sit in a curriculum — they get written when the confusion is fresh.
      </p>

      {topics.length === 0 ? (
        <div className="text-sm text-slate-500 border border-dashed border-slate-300 rounded p-8 text-center">
          No topics yet. Drop an MDX file in <code>src/topics/</code>.
        </div>
      ) : (
        <>
          {recent.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xs uppercase tracking-wide text-slate-500 font-medium mb-4">
                Recent
              </h2>
              <ul className="space-y-5">
                {recent.map((t) => (
                  <TopicRow key={t.slug} topic={t} />
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="text-xs uppercase tracking-wide text-slate-500 font-medium mb-4">
              By category
            </h2>
            <div className="space-y-8">
              {tree.map((node) => (
                <CategorySection key={node.path.join('/')} node={node} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function CategorySection({ node }: { node: CategoryNode }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-slate-900 mb-3">{node.name}</h3>
      {node.topics.length > 0 && (
        <ul className="space-y-3 mb-3">
          {node.topics.map((t) => (
            <TopicRow key={t.slug} topic={t} compact />
          ))}
        </ul>
      )}
      {node.children.length > 0 && (
        <div className="ml-4 space-y-4 border-l border-slate-100 pl-4">
          {node.children.map((child) => (
            <div key={child.path.join('/')}>
              <h4 className="text-xs font-medium text-slate-700 mb-2">{child.name}</h4>
              <ul className="space-y-3">
                {flattenLeaves(child).map((t) => (
                  <TopicRow key={t.slug} topic={t} compact />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function flattenLeaves(node: CategoryNode): Topic[] {
  return [...node.topics, ...node.children.flatMap(flattenLeaves)];
}

function TopicRow({ topic, compact = false }: { topic: Topic; compact?: boolean }) {
  return (
    <li>
      <Link to={`/topics/${topic.slug}`} className="block group">
        <div className={`font-medium text-slate-900 group-hover:text-blue-700 transition-colors ${compact ? 'text-sm' : 'text-base'}`}>
          {topic.meta.title}
        </div>
        {topic.meta.excerpt && !compact && (
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">{topic.meta.excerpt}</p>
        )}
        <p className="text-[11px] text-slate-500 mt-1">
          {topic.meta.date}
          {topic.meta.tags && topic.meta.tags.length > 0 ? ` · ${topic.meta.tags.join(' · ')}` : ''}
        </p>
      </Link>
    </li>
  );
}
