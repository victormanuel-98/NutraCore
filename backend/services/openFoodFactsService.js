const https = require('https');

const OFF_INGREDIENTS_URL = 'https://static.openfoodfacts.org/data/taxonomies/ingredients.json';
const DEFAULT_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const DEFAULT_NUTRITION_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_RESULTS = 50;
const MAX_PRODUCTS_SAMPLE = 60;
const FALLBACK_NUTRITION_PROFILES = [
  { keywords: ['pollo', 'chicken'], macros: { calories: 165, proteins: 31, carbs: 0, fats: 3.6 } },
  { keywords: ['pavo', 'turkey'], macros: { calories: 135, proteins: 29, carbs: 0, fats: 1.6 } },
  { keywords: ['cerdo', 'pork', 'lomo de cerdo', 'pork loin'], macros: { calories: 242, proteins: 27, carbs: 0, fats: 14 } },
  { keywords: ['ternera', 'res', 'beef'], macros: { calories: 250, proteins: 26, carbs: 0, fats: 15 } },
  { keywords: ['huevo', 'egg'], macros: { calories: 155, proteins: 13, carbs: 1.1, fats: 11 } },
  { keywords: ['arroz', 'rice'], macros: { calories: 130, proteins: 2.7, carbs: 28, fats: 0.3 } },
  { keywords: ['avena', 'oats', 'oatmeal'], macros: { calories: 389, proteins: 16.9, carbs: 66.3, fats: 6.9 } },
  { keywords: ['quinoa'], macros: { calories: 120, proteins: 4.4, carbs: 21.3, fats: 1.9 } },
  { keywords: ['salmon', 'salmon'], macros: { calories: 208, proteins: 20, carbs: 0, fats: 13 } },
  { keywords: ['atun', 'atún', 'tuna'], macros: { calories: 132, proteins: 29, carbs: 0, fats: 1.3 } },
  { keywords: ['patata', 'papa', 'potato'], macros: { calories: 77, proteins: 2, carbs: 17, fats: 0.1 } },
  { keywords: ['brocoli', 'brócoli', 'broccoli'], macros: { calories: 34, proteins: 2.8, carbs: 7, fats: 0.4 } },
  { keywords: ['tomate', 'tomato'], macros: { calories: 18, proteins: 0.9, carbs: 3.9, fats: 0.2 } }
];

const cacheState = {
  ingredients: [],
  loadedAt: 0,
  loadingPromise: null,
  nutritionByIngredient: new Map()
};

const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const slugify = (value) =>
  normalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const levenshteinDistance = (a = '', b = '') => {
  const left = String(a);
  const right = String(b);
  const leftLen = left.length;
  const rightLen = right.length;
  if (leftLen === 0) return rightLen;
  if (rightLen === 0) return leftLen;

  const matrix = Array.from({ length: leftLen + 1 }, () => Array(rightLen + 1).fill(0));
  for (let i = 0; i <= leftLen; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= rightLen; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= leftLen; i += 1) {
    for (let j = 1; j <= rightLen; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[leftLen][rightLen];
};

const maxTypoDistance = (queryLength) => {
  if (queryLength <= 4) return 1;
  if (queryLength <= 8) return 2;
  return 3;
};

const scoreIngredientMatch = (item, normalizedQuery, queryTokens = []) => {
  const fields = [item.normalizedName, item.normalizedEs, item.normalizedEn, item.searchText].filter(Boolean);
  if (fields.length === 0) return null;

  let bestScore = null;

  fields.forEach((field) => {
    if (field === normalizedQuery) {
      bestScore = Math.max(bestScore ?? 0, 2000);
      return;
    }

    if (field.startsWith(normalizedQuery)) {
      bestScore = Math.max(bestScore ?? 0, 1500 - Math.max(0, field.length - normalizedQuery.length));
      return;
    }

    if (field.includes(normalizedQuery)) {
      bestScore = Math.max(bestScore ?? 0, 1200 - Math.max(0, field.length - normalizedQuery.length));
    }

    const fieldTokens = field.split(/\s+/).filter(Boolean);
    if (fieldTokens.length > 0 && queryTokens.length > 0) {
      const tokenStarts = queryTokens.filter((token) => fieldTokens.some((part) => part.startsWith(token))).length;
      if (tokenStarts > 0) {
        bestScore = Math.max(bestScore ?? 0, 900 + tokenStarts * 30);
      }
    }

    const distance = levenshteinDistance(normalizedQuery, field);
    const allowed = maxTypoDistance(normalizedQuery.length);
    if (distance <= allowed) {
      bestScore = Math.max(bestScore ?? 0, 700 - distance * 100);
    } else {
      const tokenDistances = fieldTokens
        .map((token) => levenshteinDistance(normalizedQuery, token))
        .filter((dist) => dist <= allowed);
      if (tokenDistances.length > 0) {
        const minDistance = Math.min(...tokenDistances);
        bestScore = Math.max(bestScore ?? 0, 650 - minDistance * 90);
      }
    }
  });

  return bestScore;
};

const roundTo = (value, decimals = 1) => {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const requestJson = (url) =>
  new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent': 'NutraCore/1.0 (ingredient-search)'
        },
        timeout: 12000
      },
      (res) => {
        let body = '';

        res.on('data', (chunk) => {
          body += chunk;
        });

        res.on('end', () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            return reject(new Error(`Open Food Facts respondió con estado ${res.statusCode}`));
          }

          try {
            return resolve(JSON.parse(body));
          } catch {
            return reject(new Error('No se pudo parsear la respuesta de Open Food Facts'));
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error('Tiempo de espera agotado al consultar Open Food Facts'));
    });

    req.on('error', (error) => {
      reject(error);
    });
  });

const mapTaxonomyToIngredients = (taxonomy = {}) => {
  const items = [];

  Object.entries(taxonomy).forEach(([id, node]) => {
    if (!node || typeof node !== 'object') return;

    const nameEs = typeof node.name?.es === 'string' ? node.name.es.trim() : '';
    const nameEn = typeof node.name?.en === 'string' ? node.name.en.trim() : '';
    const nameFr = typeof node.name?.fr === 'string' ? node.name.fr.trim() : '';
    const fallbackName = id.includes(':') ? id.split(':')[1].replace(/-/g, ' ') : id;
    const name = nameEs || nameEn || nameFr || fallbackName;

    if (!name) return;

    const searchTerms = [name, nameEs, nameEn, nameFr, id].filter(Boolean).join(' ');

    items.push({
      id,
      name,
      nameEs: nameEs || undefined,
      nameEn: nameEn || undefined,
      normalizedName: normalizeText(name),
      normalizedEs: normalizeText(nameEs),
      normalizedEn: normalizeText(nameEn),
      searchText: normalizeText(searchTerms)
    });
  });

  return items;
};

const getCacheTtl = () => {
  const ttlMinutes = toNumber(process.env.OFF_INGREDIENTS_CACHE_MINUTES, NaN);
  if (!Number.isFinite(ttlMinutes) || ttlMinutes <= 0) return DEFAULT_CACHE_TTL_MS;
  return ttlMinutes * 60 * 1000;
};

const shouldRefreshCache = () => {
  if (!cacheState.loadedAt) return true;
  return Date.now() - cacheState.loadedAt > getCacheTtl();
};

const loadIngredients = async () => {
  const taxonomy = await requestJson(OFF_INGREDIENTS_URL);
  const ingredients = mapTaxonomyToIngredients(taxonomy);

  cacheState.ingredients = ingredients;
  cacheState.loadedAt = Date.now();

  return cacheState.ingredients;
};

const ensureIngredientsLoaded = async () => {
  if (!shouldRefreshCache() && cacheState.ingredients.length > 0) {
    return cacheState.ingredients;
  }

  if (cacheState.loadingPromise) {
    return cacheState.loadingPromise;
  }

  cacheState.loadingPromise = loadIngredients()
    .catch((error) => {
      if (cacheState.ingredients.length > 0) {
        return cacheState.ingredients;
      }
      throw error;
    })
    .finally(() => {
      cacheState.loadingPromise = null;
    });

  return cacheState.loadingPromise;
};

const searchIngredients = async (query, limit = 10) => {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery || normalizedQuery.length < 2) return [];

  const ingredients = await ensureIngredientsLoaded();
  const safeLimit = Math.max(1, Math.min(MAX_RESULTS, toNumber(limit, 10)));
  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);

  const ranked = ingredients
    .map((item) => ({
      item,
      score: scoreIngredientMatch(item, normalizedQuery, queryTokens)
    }))
    .filter((entry) => Number.isFinite(entry.score))
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return left.item.name.localeCompare(right.item.name, 'es');
    })
    .slice(0, safeLimit);

  return ranked
    .map((item) => ({
      id: item.item.id,
      name: item.item.name,
      nameEs: item.item.nameEs,
      nameEn: item.item.nameEn
    }));
};

const getNutritionCacheTtl = () => {
  const ttlMinutes = toNumber(process.env.OFF_NUTRITION_CACHE_MINUTES, NaN);
  if (!Number.isFinite(ttlMinutes) || ttlMinutes <= 0) return DEFAULT_NUTRITION_CACHE_TTL_MS;
  return ttlMinutes * 60 * 1000;
};

const getCachedNutrition = (cacheKey) => {
  const cached = cacheState.nutritionByIngredient.get(cacheKey);
  if (!cached) return null;
  if (Date.now() - cached.loadedAt > getNutritionCacheTtl()) {
    cacheState.nutritionByIngredient.delete(cacheKey);
    return null;
  }
  return cached.data;
};

const setCachedNutrition = (cacheKey, data) => {
  cacheState.nutritionByIngredient.set(cacheKey, {
    loadedAt: Date.now(),
    data
  });
};

const getMacrosFromNutriments = (nutriments = {}) => {
  const calories = toNumber(
    nutriments['energy-kcal_100g'] ?? nutriments['energy-kcal'] ?? nutriments.energy_kcal_100g,
    NaN
  );
  const proteins = toNumber(nutriments.proteins_100g ?? nutriments.proteins, NaN);
  const carbs = toNumber(nutriments.carbohydrates_100g ?? nutriments.carbohydrates, NaN);
  const fats = toNumber(nutriments.fat_100g ?? nutriments.fat, NaN);

  return {
    calories,
    proteins,
    carbs,
    fats
  };
};

const aggregateAverageMacros = (products = []) => {
  const totals = {
    calories: 0,
    proteins: 0,
    carbs: 0,
    fats: 0
  };
  const counts = {
    calories: 0,
    proteins: 0,
    carbs: 0,
    fats: 0
  };

  products.forEach((product) => {
    const macros = getMacrosFromNutriments(product?.nutriments || {});

    Object.keys(totals).forEach((key) => {
      if (Number.isFinite(macros[key])) {
        totals[key] += macros[key];
        counts[key] += 1;
      }
    });
  });

  if (!Object.values(counts).some((count) => count > 0)) {
    return null;
  }

  return {
    calories: counts.calories ? roundTo(totals.calories / counts.calories, 1) : 0,
    proteins: counts.proteins ? roundTo(totals.proteins / counts.proteins, 1) : 0,
    carbs: counts.carbs ? roundTo(totals.carbs / counts.carbs, 1) : 0,
    fats: counts.fats ? roundTo(totals.fats / counts.fats, 1) : 0
  };
};

const resolveFallbackMacros = ({ ingredientId, ingredientName, ingredientNameEn }) => {
  const haystack = normalizeText([ingredientId, ingredientNameEn, ingredientName].filter(Boolean).join(' '));
  if (!haystack) return null;

  const matched = FALLBACK_NUTRITION_PROFILES.find((entry) =>
    entry.keywords.some((keyword) => haystack.includes(normalizeText(keyword)))
  );

  if (!matched) return null;

  return {
    calories: roundTo(matched.macros.calories, 1),
    proteins: roundTo(matched.macros.proteins, 1),
    carbs: roundTo(matched.macros.carbs, 1),
    fats: roundTo(matched.macros.fats, 1)
  };
};

const fetchProductsByIngredientTag = async (ingredientTag, sampleSize = 25) => {
  const safeSample = Math.max(5, Math.min(MAX_PRODUCTS_SAMPLE, toNumber(sampleSize, 25)));
  const params = new URLSearchParams({
    ingredients_tags: ingredientTag,
    page_size: String(safeSample),
    fields: 'code,nutriments',
    sort_by: 'unique_scans_n'
  });
  const url = `https://world.openfoodfacts.org/api/v2/search?${params.toString()}`;
  const payload = await requestJson(url);
  return Array.isArray(payload?.products) ? payload.products : [];
};

const buildCandidateTags = ({ ingredientId, ingredientName, ingredientNameEn }) => {
  const set = new Set();

  if (ingredientId) set.add(String(ingredientId).trim());
  if (ingredientNameEn) {
    const slugEn = slugify(ingredientNameEn);
    if (slugEn) set.add(`en:${slugEn}`);
  }
  if (ingredientName) {
    const slug = slugify(ingredientName);
    if (slug) set.add(`en:${slug}`);
  }

  return Array.from(set).filter(Boolean);
};

const getIngredientNutritionProfile = async ({
  ingredientId,
  ingredientName,
  ingredientNameEn,
  sampleSize = 25
}) => {
  const cacheKey = `${ingredientId || ''}|${ingredientNameEn || ''}|${ingredientName || ''}|${sampleSize}`;
  const cached = getCachedNutrition(cacheKey);
  if (cached) return cached;

  const candidateTags = buildCandidateTags({ ingredientId, ingredientName, ingredientNameEn });
  let usedTag = null;
  let products = [];

  for (const tag of candidateTags) {
    try {
      const found = await fetchProductsByIngredientTag(tag, sampleSize);
      if (found.length > 0) {
        usedTag = tag;
        products = found;
        break;
      }
    } catch {
      // Intentamos con el siguiente tag candidato.
    }
  }

  const averageMacros =
    aggregateAverageMacros(products) ||
    resolveFallbackMacros({ ingredientId, ingredientName, ingredientNameEn });

  const result = {
    ingredientId: ingredientId || null,
    ingredientName: ingredientName || null,
    averageMacros,
    productsAnalyzed: products.length,
    sourceTag: usedTag
  };

  setCachedNutrition(cacheKey, result);
  return result;
};

module.exports = {
  searchIngredients,
  getIngredientNutritionProfile
};
