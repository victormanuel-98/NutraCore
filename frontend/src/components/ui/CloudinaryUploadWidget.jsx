import { useEffect, useRef } from 'react';
import { cloudinaryConfig } from '../../config/cloudinaryConfig';

/**
 * Componente que envuelve el Cloudinary Upload Widget.
 * @param {Object} props
 * @param {Function} props.onUploadSuccess - Callback que recibe la URL de la imagen subida.
 * @param {boolean} props.multiple - Si permite subir varias imágenes.
 * @param {string} props.folder - Carpeta donde se guardará en Cloudinary.
 * @param {React.ReactNode} props.children - Elemento que activa el widget al hacer click.
 */
export function CloudinaryUploadWidget({ onUploadSuccess, multiple = false, folder = 'nutracore', children }) {
  const cloudinaryRef = useRef();
  const widgetRef = useRef();

  useEffect(() => {
    // Verificar si el script de Cloudinary ya está cargado
    if (!window.cloudinary) {
      const script = document.createElement('script');
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.async = true;
      script.onload = () => {
        initWidget();
      };
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
          multiple: multiple,
          folder: folder,
          clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp'],
          maxFileSize: 5000000, // 5MB
          styles: {
            palette: {
              window: '#FFFFFF',
              windowBorder: '#90A0B3',
              tabIcon: '#EC4899',
              menuIcons: '#5A616A',
              textDark: '#000000',
              textLight: '#FFFFFF',
              link: '#EC4899',
              action: '#EC4899',
              inactiveTabIcon: '#0E2F5A',
              error: '#F44235',
              inProgress: '#0078FF',
              complete: '#20B832',
              sourceBg: '#E4EBF1'
            },
            fonts: {
              default: null,
              "'Inter', sans-serif": 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap'
            }
          }
        },
        (error, result) => {
          if (!error && result && result.event === 'success') {
            onUploadSuccess(result.info.secure_url);
          }
        }
      );
    }
  }, [onUploadSuccess, multiple, folder]);

  const openWidget = (e) => {
    e.preventDefault();
    if (widgetRef.current) {
      widgetRef.current.open();
    }
  };

  return (
    <div onClick={openWidget}>
      {children}
    </div>
  );
}
