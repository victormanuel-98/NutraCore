export const buildRecipeListPayload = () => ({
  success: true,
  data: [
    {
      _id: 'recipe-1',
      title: 'Batido Proteico Tropical',
      description: 'Batido rapido con macros equilibrados para despues de entrenar.',
      ingredients: ['Platano (100 g)', 'Proteina whey (30 g)'],
      steps: ['Mezcla todos los ingredientes y sirve frio.'],
      category: 'post-entreno',
      difficulty: 'facil',
      prepTime: 5,
      nutrition: {
        calories: 320,
        protein: 28,
        carbs: 26,
        fats: 8
      },
      tags: ['rapido', 'alta-proteina'],
      images: [],
      author: {
        _id: 'user-author',
        name: 'NutraChef',
        avatar: null
      },
      favoritedBy: [],
      favoritesCount: 2,
      averageRating: 4.5,
      reviewsCount: 8
    }
  ],
  meta: {
    page: 1,
    limit: 12,
    total: 1,
    totalPages: 1
  }
});

export async function mockCatalogSuccess(page) {
  await page.route('**/api/recipes**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(buildRecipeListPayload())
    });
  });
}

export async function mockLoginAndDashboard(page, { delayMs = 800 } = {}) {
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const method = route.request().method();

    if (path.endsWith('/auth/login') && method === 'POST') {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            token: 'frontend-e2e-token',
            user: {
              _id: 'user-1',
              email: 'qa-user@example.com',
              name: 'NutraUser0001',
              role: 'user',
              weight: 75,
              goals: {
                dailyCalories: 2200,
                protein: 140,
                carbs: 220,
                fats: 70,
                targetWeight: 72
              }
            }
          }
        })
      });
      return;
    }

    if (path.endsWith('/users/stats')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            totalFavorites: 0,
            totalRecipes: 0,
            totalSavedNews: 0,
            bmi: '24.49',
            goalProgress: {
              current: 75,
              target: 72,
              difference: 3,
              progress: 96
            }
          }
        })
      });
      return;
    }

    if (path.endsWith('/users/profile')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            _id: 'user-1',
            email: 'qa-user@example.com',
            name: 'NutraUser0001',
            role: 'user',
            weight: 75,
            bmi: '24.49',
            savedNews: [],
            goals: {
              dailyCalories: 2200,
              protein: 140,
              carbs: 220,
              fats: 70,
              targetWeight: 72,
              goal: 'lose-weight'
            }
          }
        })
      });
      return;
    }

    if (path.endsWith('/recipes/user/favorites') || path.endsWith('/recipes/user/me')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: []
        })
      });
      return;
    }

    if (path.endsWith('/users/menu-consumption') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            plannerVersionByPeriod: { daily: {}, weekly: {}, monthly: {} },
            consumedByPeriod: { daily: {}, weekly: {}, monthly: {} }
          }
        })
      });
      return;
    }

    if (path.endsWith('/users/menu-consumption') && method === 'PUT') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            plannerVersionByPeriod: { daily: {}, weekly: {}, monthly: {} },
            consumedByPeriod: { daily: {}, weekly: {}, monthly: {} }
          }
        })
      });
      return;
    }

    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        error: `Mock no definido para ${method} ${path}`
      })
    });
  });
}
