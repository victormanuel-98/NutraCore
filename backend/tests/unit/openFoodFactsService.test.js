const { EventEmitter } = require('events');

const mockGet = jest.fn();
jest.mock('https', () => ({
  get: (...args) => mockGet(...args)
}));

const emitJsonResponse = (payload, statusCode = 200) => {
  mockGet.mockImplementationOnce((url, opts, cb) => {
    const res = new EventEmitter();
    res.statusCode = statusCode;
    cb(res);
    process.nextTick(() => {
      res.emit('data', JSON.stringify(payload));
      res.emit('end');
    });
    return { on: jest.fn(), destroy: jest.fn() };
  });
};

describe('openFoodFactsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  test('searchIngredients returns [] for short query', async () => {
    const svc = require('../../services/openFoodFactsService');
    const out = await svc.searchIngredients('a');
    expect(out).toEqual([]);
  });

  test('searchIngredients loads taxonomy and returns ranked matches', async () => {
    emitJsonResponse({
      'en:apple': { name: { en: 'apple', es: 'manzana' } },
      'en:banana': { name: { en: 'banana', es: 'platano' } }
    });
    const svc = require('../../services/openFoodFactsService');
    const out = await svc.searchIngredients('manz', 5);
    expect(out.length).toBeGreaterThan(0);
    expect(out[0]).toHaveProperty('id');
  });

  test('searchIngredients clamps result limit and supports typo matches', async () => {
    emitJsonResponse({
      'en:broccoli': { name: { en: 'broccoli', es: 'brocoli' } },
      'en:banana': { name: { en: 'banana', es: 'platano' } }
    });
    const svc = require('../../services/openFoodFactsService');
    const out = await svc.searchIngredients('brocoli', 999);
    expect(out.length).toBeLessThanOrEqual(50);
    expect(out[0].id).toBe('en:broccoli');
  });

  test('getIngredientNutritionProfile uses fallback when no products', async () => {
    emitJsonResponse({ products: [] });
    const svc = require('../../services/openFoodFactsService');
    const out = await svc.getIngredientNutritionProfile({
      ingredientId: 'en:pollo',
      ingredientName: 'pollo'
    });
    expect(out).toHaveProperty('averageMacros');
    expect(out.averageMacros).not.toBeNull();
  });

  test('getIngredientNutritionProfile aggregates products nutriments', async () => {
    emitJsonResponse({
      products: [
        { nutriments: { 'energy-kcal_100g': 100, proteins_100g: 10, carbohydrates_100g: 20, fat_100g: 5 } },
        { nutriments: { 'energy-kcal_100g': 200, proteins_100g: 20, carbohydrates_100g: 30, fat_100g: 10 } }
      ]
    });
    const svc = require('../../services/openFoodFactsService');
    const out = await svc.getIngredientNutritionProfile({
      ingredientId: 'en:rice',
      ingredientNameEn: 'rice'
    });
    expect(out.averageMacros.calories).toBe(150);
    expect(out.productsAnalyzed).toBe(2);
  });

  test('getIngredientNutritionProfile returns null average when no products and no fallback', async () => {
    emitJsonResponse({ products: [] });
    const svc = require('../../services/openFoodFactsService');
    const out = await svc.getIngredientNutritionProfile({
      ingredientId: 'en:unknown-ingredient',
      ingredientName: 'xxzzqq'
    });
    expect(out.averageMacros).toBeNull();
    expect(out.productsAnalyzed).toBe(0);
  });
});
