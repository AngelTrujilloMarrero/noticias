import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';
import './styles/layout.css';
import './styles/sidebar.css';
import './styles/news.css';
import './styles/columns.css';
import './styles/article.css';
import './styles/mobile.css';
import './styles/mobile-article.css';
import './styles/mobile-drawer.css';
import './styles/mobile-status.css';
import './styles/dark.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
