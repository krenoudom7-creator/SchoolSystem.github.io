import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { SCHOOL_LOGO_URL } from './utils/schoolLogo.ts';
import './index.css';

const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
if (favicon) {
  favicon.href = SCHOOL_LOGO_URL;
}

createRoot(document.getElementById('root')!).render(<App />);

