export const CLOUDINARY_STATIC_ASSETS = {
  '/images/home/Batido-de-frutos-rojos.jpg': 'https://res.cloudinary.com/do8tro4tx/image/upload/v1778192925/nutracore/static/home/Batido-de-frutos-rojos.jpg',
  '/images/home/BurguerNutra.png': 'https://res.cloudinary.com/do8tro4tx/image/upload/v1778192937/nutracore/static/home/BurguerNutra.png',
  '/images/home/batidora.mp4': 'https://res.cloudinary.com/do8tro4tx/video/upload/v1778192927/nutracore/static/home/batidora.mp4',
  '/images/home/bowlYzumo.mp4': 'https://res.cloudinary.com/do8tro4tx/video/upload/v1778192934/nutracore/static/home/bowlYzumo.mp4',
  '/images/home/bowlpadthai.mp4': 'https://res.cloudinary.com/do8tro4tx/video/upload/v1778192931/nutracore/static/home/bowlpadthai.mp4',
  '/images/home/echarzumo.mp4': 'https://res.cloudinary.com/do8tro4tx/video/upload/v1778192939/nutracore/static/home/echarzumo.mp4',
  '/images/home/hombreEnGym.jpg': 'https://res.cloudinary.com/do8tro4tx/image/upload/v1778192940/nutracore/static/home/hombreEnGym.jpg',
  '/images/home/prebatir.mp4': 'https://res.cloudinary.com/do8tro4tx/video/upload/v1778192943/nutracore/static/home/prebatir.mp4',
  '/images/home/zumoFresa.mp4': 'https://res.cloudinary.com/do8tro4tx/video/upload/v1778192947/nutracore/static/home/zumoFresa.mp4',
  '/images/home/zumokiwi.mp4': 'https://res.cloudinary.com/do8tro4tx/video/upload/v1778192950/nutracore/static/home/zumokiwi.mp4',
  '/images/home/zumos.mp4': 'https://res.cloudinary.com/do8tro4tx/video/upload/v1778192954/nutracore/static/home/zumos.mp4',
  '/images/logos/PanelLateral.png': 'https://res.cloudinary.com/do8tro4tx/image/upload/v1778192957/nutracore/static/logos/PanelLateral.jpg',
  '/images/logos/gaius-avatar.png': 'https://res.cloudinary.com/do8tro4tx/image/upload/v1778192956/nutracore/static/logos/gaius-avatar.png',
  '/images/logos/nutracoreFavicon.png': 'https://res.cloudinary.com/do8tro4tx/image/upload/v1778192957/nutracore/static/logos/nutracoreFavicon.png',
  '/images/news/news-1.jpg': 'https://res.cloudinary.com/do8tro4tx/image/upload/v1778194129/nutracore/static/news/news-1.png',
  '/images/news/news-2.jpg': 'https://res.cloudinary.com/do8tro4tx/image/upload/v1778193038/nutracore/static/news/news-2.jpg',
  '/images/news/news-3.jpg': 'https://res.cloudinary.com/do8tro4tx/image/upload/v1778193039/nutracore/static/news/news-3.jpg',
  '/images/news/news-4.jpg': 'https://res.cloudinary.com/do8tro4tx/image/upload/v1778193041/nutracore/static/news/news-4.jpg',
  '/images/news/news-5.jpg': 'https://res.cloudinary.com/do8tro4tx/image/upload/v1778193044/nutracore/static/news/news-5.jpg',
  '/images/news/news-6.jpg': 'https://res.cloudinary.com/do8tro4tx/image/upload/v1778193045/nutracore/static/news/news-6.jpg'
};

export const getCloudinaryStaticAsset = (path, fallback = path) =>
  CLOUDINARY_STATIC_ASSETS[path] || fallback;
