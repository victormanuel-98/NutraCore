import { useCallback, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { LoadingScreen } from './components/LoadingScreen';
import { router } from './routes';

const shouldShowInitialLoader = import.meta.env.VITE_SKIP_LOADING_SCREEN !== '1';

export default function App() {
  const [showLoader, setShowLoader] = useState(shouldShowInitialLoader);

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
