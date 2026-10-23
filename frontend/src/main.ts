import '@fontsource/roboto-serif/500.css';
import '@fontsource/roboto-serif/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import './styles/variables.css';
import './styles/base.css';
import './styles/animations.css';
import './styles/button.css';
import './styles/input.css';
import './router';
import './app-root';

// analytics only for the deployed site, not during development
if (import.meta.env.PROD) {
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://eu.umami.is/script.js';
  script.dataset['websiteId'] = '83b4bce8-ba64-4cd6-a81b-a874e7c82e0b';
  document.head.append(script);
}
