import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/newsreader/latin-400.css';
import '@fontsource/newsreader/latin-400-italic.css';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-700.css';
import 'katex/dist/katex.min.css';
import { App } from './App';
import './styles/article.css';
import './styles/labs.css';
import './styles/lessons.css';

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
