import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import IndexPage from './pages/Index';
import TopicPage from './components/TopicPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/topics/:slug" element={<TopicPage />} />
      </Routes>
    </Layout>
  );
}
