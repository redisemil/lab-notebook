import { useState, useMemo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { topics, buildCategoryTree, searchTopics, type CategoryNode, type Topic } from '../lib/topics';

const STORAGE_KEY = 'notebook.collapsed-categories';

function loadCollapsed(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveCollapsed(set: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(() => loadCollapsed());

  useEffect(() => {
    saveCollapsed(collapsed);
  }, [collapsed]);

  const tree = useMemo(() => buildCategoryTree(topics), []);
  const results = useMemo(() => searchTopics(topics, query), [query]);

  const toggle = (key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 w-72
        md:relative md:w-64 md:z-auto
        md:shrink-0 md:h-screen md:sticky md:top-0
        flex flex-col
        bg-slate-50 border-r border-slate-300
        overflow-y-auto
        transform transition-transform duration-200 ease-out
        ${isOpen ? 'translate-x-0 shadow-xl md:shadow-none' : '-translate-x-full md:translate-x-0'}
      `}
    >
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="min-w-0">
          <Link to="/" className="block text-sm font-medium text-slate-900 hover:text-blue-700 truncate">
            notebook
          </Link>
          <p className="text-[11px] text-slate-600 mt-0.5">things i'm trying to understand</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close navigation"
          className="md:hidden p-1.5 -mr-1 rounded text-slate-600 hover:bg-slate-200 active:bg-slate-300"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
      </div>

      <div className="p-3 border-b border-slate-200">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search..."
          className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-500"
        />
      </div>

      <nav className="flex-1 p-2 text-sm">
        {query.trim() ? (
          <SearchResults results={results} query={query} />
        ) : (
          <CategoryTree nodes={tree} collapsed={collapsed} onToggle={toggle} />
        )}
      </nav>
    </aside>
  );
}

function SearchResults({ results, query }: { results: Topic[]; query: string }) {
  if (!results.length) {
    return (
      <p className="px-2 py-2 text-xs text-slate-600">
        No matches for <span className="font-mono">{query}</span>.
      </p>
    );
  }
  return (
    <ul className="space-y-0.5">
      {results.map((t) => (
        <li key={t.slug}>
          <TopicLink topic={t} showPath />
        </li>
      ))}
    </ul>
  );
}

function CategoryTree({
  nodes,
  collapsed,
  onToggle,
}: {
  nodes: CategoryNode[];
  collapsed: Set<string>;
  onToggle: (key: string) => void;
}) {
  if (!nodes.length) {
    return (
      <p className="px-2 py-2 text-xs text-slate-600">
        No topics yet. Drop an MDX file in <code className="text-[10px]">src/topics/</code>.
      </p>
    );
  }
  return (
    <ul className="space-y-0.5">
      {nodes.map((node) => (
        <CategoryItem key={node.path.join('/')} node={node} collapsed={collapsed} onToggle={onToggle} depth={0} />
      ))}
    </ul>
  );
}

function CategoryItem({
  node,
  collapsed,
  onToggle,
  depth,
}: {
  node: CategoryNode;
  collapsed: Set<string>;
  onToggle: (key: string) => void;
  depth: number;
}) {
  const key = node.path.join('/');
  const isCollapsed = collapsed.has(key);
  const indent = { paddingLeft: `${depth * 0.75 + 0.5}rem` };

  return (
    <li>
      <button
        onClick={() => onToggle(key)}
        className="w-full flex items-center gap-1.5 px-2 py-1 text-left text-slate-800 hover:bg-slate-200/70 rounded text-[13px] font-medium"
        style={indent}
      >
        <span className="text-slate-500 text-[10px] w-2.5 inline-block">
          {isCollapsed ? '▸' : '▾'}
        </span>
        <span>{node.name}</span>
        <span className="ml-auto text-[10px] text-slate-500 font-normal">{countTopics(node)}</span>
      </button>

      {!isCollapsed && (
        <ul className="space-y-0.5">
          {node.children.map((child) => (
            <CategoryItem
              key={child.path.join('/')}
              node={child}
              collapsed={collapsed}
              onToggle={onToggle}
              depth={depth + 1}
            />
          ))}
          {node.topics.map((topic) => (
            <li key={topic.slug} style={{ paddingLeft: `${(depth + 1) * 0.75 + 0.5}rem` }}>
              <TopicLink topic={topic} />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function TopicLink({ topic, showPath = false }: { topic: Topic; showPath?: boolean }) {
  const location = useLocation();
  const active = location.pathname === `/topics/${topic.slug}`;

  return (
    <Link
      to={`/topics/${topic.slug}`}
      className={`block px-2 py-1 rounded text-[13px] leading-tight ${
        active
          ? 'bg-blue-100 text-blue-900 font-medium'
          : 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
      }`}
    >
      <span className="block truncate">{topic.meta.title}</span>
      {showPath && topic.meta.category && (
        <span className="block text-[10px] text-slate-500 truncate mt-0.5">
          {topic.meta.category.join(' › ')}
        </span>
      )}
    </Link>
  );
}

function countTopics(node: CategoryNode): number {
  return node.topics.length + node.children.reduce((acc, c) => acc + countTopics(c), 0);
}
