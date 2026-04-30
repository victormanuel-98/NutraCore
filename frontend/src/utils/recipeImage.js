export const fallbackRecipeImage = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120">
  <rect width="160" height="120" fill="#d1d5db"/>
  <g shape-rendering="crispEdges">
    <rect x="28" y="34" width="104" height="8" fill="#f59e0b"/>
    <rect x="24" y="42" width="112" height="8" fill="#fbbf24"/>
    <rect x="30" y="50" width="100" height="6" fill="#16a34a"/>
    <rect x="26" y="56" width="108" height="8" fill="#111827"/>
    <rect x="24" y="64" width="112" height="8" fill="#f43f5e"/>
    <rect x="28" y="72" width="104" height="8" fill="#f59e0b"/>
    <rect x="34" y="80" width="92" height="8" fill="#fbbf24"/>
    <rect x="58" y="58" width="8" height="8" fill="#111827"/>
    <rect x="94" y="58" width="8" height="8" fill="#111827"/>
    <rect x="66" y="72" width="28" height="4" fill="#111827"/>
  </g>
</svg>
`)}`;

export const getRecipeImage = (recipe = {}) => {
  const firstImage = Array.isArray(recipe.images) && recipe.images.length > 0 ? recipe.images[0] : "";
  if (typeof firstImage === "string" && firstImage.trim()) return firstImage;
  return fallbackRecipeImage;
};

