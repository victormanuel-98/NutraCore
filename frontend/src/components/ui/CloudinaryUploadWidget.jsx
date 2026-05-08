import { useEffect, useRef } from 'react';
import { cloudinaryConfig } from '../../config/cloudinaryConfig';

export function CloudinaryUploadWidget({
  onUploadSuccess,
  multiple = false,
  folder = 'nutracore',
  maxFiles = 1,
  allowedFormats = ['png', 'jpg', 'jpeg', 'webp'],
  children
}) {
  const cloudinaryRef = useRef(null);
  const widgetRef = useRef(null);

  useEffect(() => {
    if (!window.cloudinary) {
      const script = document.createElement('script');
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.async = true;
      script.onload = () => initWidget();
      document.body.appendChild(script);
    } else {
      initWidget();
    }

    function initWidget() {
      cloudinaryRef.current = window.cloudinary;
      widgetRef.current = cloudinaryRef.current.createUploadWidget(
        {
          cloudName: cloudinaryConfig.cloudName,
          uploadPreset: cloudinaryConfig.uploadPreset,
          multiple,
          maxFiles,
          folder,
          resourceType: 'image',
          clientAllowedFormats: allowedFormats,
          maxFileSize: 5_000_000,
          sources: ['local', 'camera', 'url'],
          showAdvancedOptions: false,
          singleUploadAutoClose: false,
          showCompletedButton: true,
          styles: {
            palette: {
              window: '#fff7fb',
              windowBorder: '#ff0a60',
              tabIcon: '#ec4899',
              menuIcons: '#111827',
              textDark: '#111827',
              textLight: '#ffffff',
              link: '#ec4899',
              action: '#ec4899',
              inactiveTabIcon: '#4b5563',
              error: '#f44235',
              inProgress: '#0078ff',
              complete: '#20b832',
              sourceBg: '#fff1f6'
            },
            fonts: {
              default: null,
              "'Bitcount Single', monospace": 'https://fonts.googleapis.com/css2?family=Bitcount+Single&display=swap'
            }
          }
        },
        (error, result) => {
          if (!error && result?.event === 'success') {
            onUploadSuccess?.(result.info.secure_url);
          }
        }
      );
    }
  }, [allowedFormats, folder, maxFiles, multiple, onUploadSuccess]);

  const openWidget = (event) => {
    event.preventDefault();
    widgetRef.current?.open();
  };

  return <div onClick={openWidget}>{children}</div>;
}
