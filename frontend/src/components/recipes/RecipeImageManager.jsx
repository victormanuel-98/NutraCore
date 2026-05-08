import { useMemo, useState } from 'react';
import { ChevronDown, ImagePlus, X } from 'lucide-react';
import { Button } from '../ui/button';
import { CloudinaryUploadWidget } from '../ui/CloudinaryUploadWidget';

const ALLOWED_IMAGE_FORMATS = ['PNG', 'JPG', 'JPEG', 'WEBP'];

export function RecipeImageManager({
  images = [],
  onChange,
  disabled = false,
  title = 'Imágenes de la receta',
  helperText = 'Máximo 5 imágenes por receta.',
  folder = 'nutracore/recipes',
  maxImages = 5
}) {
  const [isOpen, setIsOpen] = useState(false);
  const safeImages = Array.isArray(images) ? images.filter(Boolean).slice(0, maxImages) : [];
  const remainingSlots = Math.max(0, maxImages - safeImages.length);

  const summaryText = useMemo(() => {
    if (safeImages.length === 0) return 'No hay imágenes cargadas';
    if (safeImages.length === 1) return '1 imagen cargada';
    return `${safeImages.length} imágenes cargadas`;
  }, [safeImages.length]);

  const handleAddImage = (url) => {
    if (!url || safeImages.length >= maxImages) return;
    if (safeImages.includes(url)) return;
    onChange?.([...safeImages, url].slice(0, maxImages));
  };

  const handleRemoveImage = (index) => {
    onChange?.(safeImages.filter((_, imageIndex) => imageIndex !== index));
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="uppercase font-bold text-xs tracking-widest text-gray-700">{title}</p>
        <p className="text-xs text-gray-500">{helperText}</p>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full border-2 border-dashed border-pink-accent/40 rounded-none bg-white p-4 text-left transition-all duration-150 hover:border-pink-accent hover:bg-pink-50/40 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-pink-500/10"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-pink-accent/25 bg-pink-50">
              <ImagePlus className="h-5 w-5 text-pink-accent" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-tight text-gray-800">{summaryText}</p>
              <p className="text-xs text-gray-500">Formatos permitidos: {ALLOWED_IMAGE_FORMATS.join(', ')}</p>
            </div>
          </div>
          <ChevronDown className={`h-5 w-5 text-gray-700 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="border-2 border-pink-accent bg-white shadow-[8px_8px_0px_0px_#ff0a60]">
          <div className="flex items-start justify-between gap-4 border-b-2 border-pink-accent/20 px-6 py-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Gestor de imágenes</h3>
              <p className="text-sm text-gray-600">Máximo {maxImages} imágenes.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-10 w-10 items-center justify-center border-2 border-gray-900 bg-white text-gray-900 transition-all duration-150 hover:border-pink-accent hover:bg-pink-50 hover:text-pink-accent"
              aria-label="Cerrar gestor de imágenes"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6 bg-gray-50 p-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-4 border-2 border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Imágenes cargadas</p>
                  <p className="text-2xl font-semibold text-gray-900">{safeImages.length}/{maxImages}</p>
                </div>
                <div className="flex items-center">
                  {remainingSlots > 0 ? (
                    <CloudinaryUploadWidget
                      onUploadSuccess={handleAddImage}
                      multiple={remainingSlots > 1}
                      folder={folder}
                      maxFiles={remainingSlots}
                      allowedFormats={['png', 'jpg', 'jpeg', 'webp']}
                    >
                      <Button
                        type="button"
                        className="rounded-none bg-pink-accent text-white transition-all duration-150 hover:-translate-y-0.5 hover:bg-pink-accent/90 hover:shadow-[4px_4px_0px_0px_rgba(255,10,96,0.24)]"
                      >
                        <ImagePlus className="mr-2 h-4 w-4" />
                        Añadir imágenes
                      </Button>
                    </CloudinaryUploadWidget>
                  ) : (
                    <p className="text-xs font-semibold uppercase text-gray-500">Límite alcanzado</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {safeImages.length > 0 ? (
                  safeImages.map((image, index) => (
                    <div key={`manager-image-${index}`} className="border-2 border-gray-200 bg-white p-3">
                      <div className="flex items-center gap-4">
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden border border-gray-200 bg-gray-50">
                          <img src={image} alt={`Imagen receta ${index + 1}`} className="h-full w-full object-cover" />
                        </div>

                        <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
                          <div className="space-y-1">
                            <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Imagen</p>
                            <p className="text-sm font-semibold text-gray-900">{index + 1}</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="inline-flex h-9 w-9 items-center justify-center border border-red-200 text-red-600 transition-colors hover:border-red-500 hover:bg-red-50 hover:text-red-700"
                            aria-label={`Eliminar imagen ${index + 1}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="border-2 border-dashed border-gray-300 bg-white p-8 text-center">
                    <p className="text-sm font-semibold uppercase text-gray-700">Todavía no hay imágenes</p>
                    <p className="mt-2 text-xs text-gray-500">Añade imágenes y elimina las que no quieras conservar.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
