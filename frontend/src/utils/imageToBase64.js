export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
    reader.readAsDataURL(file);
  });
}

export async function filesToBase64(fileList, maxFiles = 5) {
  const files = Array.from(fileList || []).slice(0, maxFiles);
  const images = await Promise.all(files.map((file) => fileToBase64(file)));
  return images;
}
