import { Link } from 'react-router-dom';

export default function Breadcrumb({ category }: { category?: string[] }) {
  if (!category || !category.length) return null;
  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
      <Link to="/" className="hover:text-slate-900">
        notebook
      </Link>
      {category.map((segment, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="text-slate-300">›</span>
          <span>{segment}</span>
        </span>
      ))}
    </nav>
  );
}
