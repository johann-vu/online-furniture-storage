import './app-root';

// analytics only for the deployed site, not during development
if (import.meta.env.PROD) {
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://eu.umami.is/script.js';
  script.dataset['websiteId'] = '83b4bce8-ba64-4cd6-a81b-a874e7c82e0b';
  document.head.append(script);
}
