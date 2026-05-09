const baseSpec = require('./openapi.json');

const clone = (value) => JSON.parse(JSON.stringify(value));

const buildOpenApiSpec = () => {
  const spec = clone(baseSpec);

  spec.info = {
    ...spec.info,
    title: 'NutraCore API',
    version: '1.1.0',
    description: 'Documentacion OpenAPI del backend NutraCore'
  };

  spec.components = spec.components || {};
  spec.components.schemas = spec.components.schemas || {};
  spec.components.responses = spec.components.responses || {};

  spec.components.schemas.ErrorResponse = {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      code: { type: 'string', example: 'VALIDATION_ERROR' },
      error: { type: 'string', example: 'Error de validacion' },
      details: {
        oneOf: [
          { type: 'array', items: { type: 'string' } },
          { type: 'object', additionalProperties: true }
        ]
      }
    }
  };

  spec.components.schemas.MenuConsumptionState = {
    type: 'object',
    properties: {
      plannerVersionByPeriod: {
        type: 'object',
        properties: {
          daily: { type: 'object', additionalProperties: { type: 'integer' } },
          weekly: { type: 'object', additionalProperties: { type: 'integer' } },
          monthly: { type: 'object', additionalProperties: { type: 'integer' } }
        }
      },
      consumedByPeriod: {
        type: 'object',
        properties: {
          daily: {
            type: 'object',
            additionalProperties: {
              type: 'object',
              additionalProperties: { type: 'boolean' }
            }
          },
          weekly: {
            type: 'object',
            additionalProperties: {
              type: 'object',
              additionalProperties: { type: 'boolean' }
            }
          },
          monthly: {
            type: 'object',
            additionalProperties: {
              type: 'object',
              additionalProperties: { type: 'boolean' }
            }
          }
        }
      }
    }
  };

  spec.components.schemas.NewsletterSubscribeRequest = {
    type: 'object',
    required: ['email'],
    properties: {
      email: { type: 'string', format: 'email' }
    }
  };

  spec.components.schemas.UserStatsResponse = {
    type: 'object',
    properties: {
      totalFavorites: { type: 'integer', example: 4 },
      totalRecipeFavorites: { type: 'integer', example: 4 },
      totalDishFavorites: { type: 'integer', example: 2 },
      totalSavedNews: { type: 'integer', example: 3 },
      totalRecipes: { type: 'integer', example: 6 },
      bmi: { type: 'string', example: '24.69', nullable: true },
      goalProgress: {
        nullable: true,
        type: 'object',
        properties: {
          current: { type: 'number', example: 82 },
          target: { type: 'number', example: 76 },
          difference: { type: 'number', example: 6 },
          progress: { type: 'integer', example: 93 }
        }
      }
    }
  };

  spec.components.schemas.UserGoalsUpdateRequest = {
    type: 'object',
    properties: {
      targetWeight: { type: 'number', example: 76 },
      dailyCalories: { type: 'number', example: 2300 },
      protein: { type: 'number', example: 150 },
      carbs: { type: 'number', example: 210 },
      fats: { type: 'number', example: 70 },
      activityLevel: {
        type: 'string',
        enum: ['sedentary', 'light', 'moderate', 'active', 'very-active'],
        example: 'moderate'
      },
      goal: {
        type: 'string',
        enum: ['lose-weight', 'maintain', 'gain-muscle', 'improve-health'],
        example: 'gain-muscle'
      }
    }
  };

  spec.components.schemas.UserPreferencesUpdateRequest = {
    type: 'object',
    properties: {
      dietary: {
        type: 'array',
        items: { type: 'string' },
        example: ['vegetarian']
      },
      allergies: {
        type: 'array',
        items: { type: 'string' },
        example: ['gluten']
      }
    }
  };

  spec.components.schemas.AdminAuditLog = {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '6820f15cc6df3b3f86123456' },
      action: { type: 'string', example: 'user.suspend' },
      actorRole: { type: 'string', example: 'admin' },
      targetType: { type: 'string', example: 'User' },
      targetId: { type: 'string', example: '6820f15cc6df3b3f86129999' },
      ip: { type: 'string', example: '127.0.0.1' },
      createdAt: { type: 'string', format: 'date-time' }
    }
  };

  spec.paths['/api/auth/test-email'] = {
    post: {
      tags: ['Auth'],
      summary: 'Enviar correo de prueba administrativo',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: { type: 'string', format: 'email', example: 'admin@nutracore.local' }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Correo de prueba enviado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Correo de prueba enviado correctamente a admin@nutracore.local' }
                }
              }
            }
          }
        },
        '400': { $ref: '#/components/responses/BadRequest' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' }
      }
    }
  };

  spec.paths['/api/users/stats'] = {
    get: {
      tags: ['Users'],
      summary: 'Obtener estadísticas del usuario autenticado',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'Estadísticas calculadas',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/UserStatsResponse' }
                }
              }
            }
          }
        },
        '401': { $ref: '#/components/responses/Unauthorized' }
      }
    }
  };

  spec.paths['/api/users/goals'] = {
    put: {
      tags: ['Users'],
      summary: 'Actualizar objetivos nutricionales del usuario',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UserGoalsUpdateRequest' }
          }
        }
      },
      responses: {
        '200': {
          description: 'Objetivos actualizados',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      goals: { $ref: '#/components/schemas/UserGoalsUpdateRequest' }
                    }
                  },
                  message: { type: 'string', example: 'Objetivos actualizados exitosamente' }
                }
              }
            }
          }
        },
        '400': { $ref: '#/components/responses/BadRequest' },
        '401': { $ref: '#/components/responses/Unauthorized' }
      }
    }
  };

  spec.paths['/api/users/preferences'] = {
    put: {
      tags: ['Users'],
      summary: 'Actualizar preferencias dietéticas del usuario',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UserPreferencesUpdateRequest' }
          }
        }
      },
      responses: {
        '200': {
          description: 'Preferencias actualizadas',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      preferences: { $ref: '#/components/schemas/UserPreferencesUpdateRequest' }
                    }
                  },
                  message: { type: 'string', example: 'Preferencias actualizadas exitosamente' }
                }
              }
            }
          }
        },
        '401': { $ref: '#/components/responses/Unauthorized' }
      }
    }
  };

  spec.paths['/api/users/account'] = {
    delete: {
      tags: ['Users'],
      summary: 'Desactivar cuenta propia',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'Cuenta desactivada',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Cuenta desactivada exitosamente' }
                }
              }
            }
          }
        },
        '403': { $ref: '#/components/responses/Forbidden' },
        '401': { $ref: '#/components/responses/Unauthorized' }
      }
    }
  };

  spec.paths['/api/users/admin/audit/logs'] = {
    get: {
      tags: ['Users'],
      summary: 'Obtener logs de auditoría administrativos',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'limit',
          in: 'query',
          required: false,
          schema: { type: 'integer', minimum: 1, maximum: 200, default: 50 }
        }
      ],
      responses: {
        '200': {
          description: 'Eventos de auditoría',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/AdminAuditLog' }
                  }
                }
              }
            }
          }
        },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' }
      }
    }
  };

  spec.paths['/api/users/menu-consumption'] = {
    get: {
      tags: ['Users'],
      summary: 'Obtener estado persistido del menú automático',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'Estado del menú automático',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/MenuConsumptionState' }
                }
              }
            }
          }
        },
        '401': { $ref: '#/components/responses/Unauthorized' }
      }
    },
    put: {
      tags: ['Users'],
      summary: 'Persistir estado del menú automático',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/MenuConsumptionState' }
          }
        }
      },
      responses: {
        '200': {
          description: 'Estado persistido',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/MenuConsumptionState' },
                  message: { type: 'string', example: 'Consumo de menú guardado' }
                }
              }
            }
          }
        },
        '401': { $ref: '#/components/responses/Unauthorized' }
      }
    }
  };

  spec.paths['/api/news/newsletter/subscribe'] = {
    post: {
      tags: ['News'],
      summary: 'Suscribirse al boletín de noticias',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/NewsletterSubscribeRequest' }
          }
        }
      },
      responses: {
        '200': {
          description: 'Suscripción registrada',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Suscripcion registrada y correo enviado' }
                }
              }
            }
          }
        },
        '400': { $ref: '#/components/responses/BadRequest' },
        '500': { $ref: '#/components/responses/ServerError' }
      }
    }
  };

  return spec;
};

module.exports = buildOpenApiSpec;
