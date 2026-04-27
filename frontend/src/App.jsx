import { useCallback, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { LoadingScreen } from './components/LoadingScreen';
import { router } from './routes';

export default function App() {
  const [showLoader, setShowLoader] = useState(true);

  const handleLoaderComplete = useCallback(() => {
    setShowLoader(false);
  }, []);

  return (
    <>
      {showLoader ? <LoadingScreen onComplete={handleLoaderComplete} /> : null}
      <div className={`app-shell ${showLoader ? 'app-shell-hidden' : 'app-shell-visible'}`}>
        <RouterProvider router={router} />
      </div>
    </>
  );
}

