/**
 * Script de Seed para NutraCore
 * 
 * Puebla la base de datos con datos de ejemplo
 * USAR SOLO EN DESARROLLO
 * 
 * Ejecutar: node seed.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Importar modelos
const User = require('./models/User');
const Dish = require('./models/Dish');
const News = require('./models/News');
const Recipe = require('./models/Recipe');

// Datos de ejemplo

const users = [
  {
    email: 'demo@nutracore.com',
    password: 'demo123',
    name: 'Usuario Demo',
    age: 28,
    gender: 'other',
    height: 170,
    weight: 70,
    goals: {
      targetWeight: 65,
      dailyCalories: 2000,
      protein: 150,
      carbs: 200,
      fats: 60,
      activityLevel: 'moderate',
      goal: 'lose-weight'
    }
  }
];

const dishes = [
  {
    name: 'Ensalada César con Pollo',
    description: 'Ensalada fresca con lechuga romana, pollo a la parrilla, queso parmesano y aderezo césar ligero',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
    category: 'lunch',
    nutrition: {
      calories: 350,
      protein: 35,
      carbs: 20,
      fats: 15,
      fiber: 5,
      sugar: 3
    },
    servings: 1,
    prepTime: 15,
    difficulty: 'easy',
    ingredients: [
      { name: 'Lechuga romana', amount: '200g' },
      { name: 'Pechuga de pollo', amount: '150g' },
      { name: 'Queso parmesano', amount: '30g' },
      { name: 'Pan integral', amount: '50g' },
      { name: 'Aderezo césar light', amount: '30ml' }
    ],
    instructions: [
      { step: 1, description: 'Lavar y cortar la lechuga romana' },
      { step: 2, description: 'Cocinar el pollo a la parrilla y cortar en tiras' },
      { step: 3, description: 'Tostar el pan y cortar en cubos' },
      { step: 4, description: 'Mezclar todos los ingredientes' },
      { step: 5, description: 'Añadir el aderezo y servir' }
    ],
    tags: ['high-protein', 'low-carb', 'quick'],
    featured: true
  },
  {
    name: 'Batido Proteico de Plátano',
    description: 'Batido cremoso con plátano, proteína whey, avena y mantequilla de maní',
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800',
    category: 'breakfast',
    nutrition: {
      calories: 420,
      protein: 40,
      carbs: 45,
      fats: 12,
      fiber: 6,
      sugar: 18
    },
    servings: 1,
    prepTime: 5,
    difficulty: 'easy',
    ingredients: [
      { name: 'Plátano', amount: '1 unidad' },
      { name: 'Proteína whey', amount: '30g' },
      { name: 'Avena', amount: '40g' },
      { name: 'Mantequilla de maní', amount: '15g' },
      { name: 'Leche desnatada', amount: '250ml' }
    ],
    instructions: [
      { step: 1, description: 'Pelar el plátano' },
      { step: 2, description: 'Añadir todos los ingredientes a la licuadora' },
      { step: 3, description: 'Licuar hasta obtener consistencia cremosa' },
      { step: 4, description: 'Servir inmediatamente' }
    ],
    tags: ['high-protein', 'quick', 'vegetarian'],
    featured: true
  },
  {
    name: 'Salmón al Horno con Verduras',
    description: 'Filete de salmón horneado con brócoli, zanahorias y espárragos',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800',
    category: 'dinner',
    nutrition: {
      calories: 480,
      protein: 42,
      carbs: 25,
      fats: 24,
      fiber: 8,
      sugar: 6
    },
    servings: 1,
    prepTime: 30,
    difficulty: 'medium',
    ingredients: [
      { name: 'Salmón', amount: '180g' },
      { name: 'Brócoli', amount: '100g' },
      { name: 'Zanahorias', amount: '80g' },
      { name: 'Espárragos', amount: '80g' },
      { name: 'Aceite de oliva', amount: '10ml' },
      { name: 'Limón', amount: '1/2 unidad' }
    ],
    instructions: [
      { step: 1, description: 'Precalentar horno a 200°C' },
      { step: 2, description: 'Cortar las verduras' },
      { step: 3, description: 'Colocar el salmón y verduras en bandeja' },
      { step: 4, description: 'Rociar con aceite de oliva y jugo de limón' },
      { step: 5, description: 'Hornear 20-25 minutos' }
    ],
    tags: ['high-protein', 'low-carb', 'paleo'],
    featured: false
  },
  {
    name: 'Bowl Vegano de Quinoa',
    description: 'Bowl completo con quinoa, garbanzos, aguacate, tomate y espinacas',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
    category: 'lunch',
    nutrition: {
      calories: 520,
      protein: 18,
      carbs: 65,
      fats: 20,
      fiber: 15,
      sugar: 5
    },
    servings: 1,
    prepTime: 25,
    difficulty: 'easy',
    ingredients: [
      { name: 'Quinoa', amount: '80g' },
      { name: 'Garbanzos cocidos', amount: '100g' },
      { name: 'Aguacate', amount: '1/2 unidad' },
      { name: 'Tomate cherry', amount: '100g' },
      { name: 'Espinacas frescas', amount: '50g' },
      { name: 'Tahini', amount: '20g' }
    ],
    instructions: [
      { step: 1, description: 'Cocinar la quinoa según instrucciones' },
      { step: 2, description: 'Cortar el aguacate y tomates' },
      { step: 3, description: 'Armar el bowl con todos los ingredientes' },
      { step: 4, description: 'Añadir tahini como aderezo' }
    ],
    tags: ['vegan', 'vegetarian', 'high-protein'],
    featured: true
  },
  {
    name: 'Tortilla de Claras con Espinacas',
    description: 'Tortilla ligera de claras de huevo con espinacas frescas y queso bajo en grasa',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800',
    category: 'breakfast',
    nutrition: {
      calories: 220,
      protein: 28,
      carbs: 8,
      fats: 9,
      fiber: 2,
      sugar: 2
    },
    servings: 1,
    prepTime: 10,
    difficulty: 'easy',
    ingredients: [
      { name: 'Claras de huevo', amount: '4 unidades' },
      { name: 'Espinacas frescas', amount: '50g' },
      { name: 'Queso bajo en grasa', amount: '30g' },
      { name: 'Tomate', amount: '50g' },
      { name: 'Aceite en spray', amount: '5ml' }
    ],
    instructions: [
      { step: 1, description: 'Batir las claras de huevo' },
      { step: 2, description: 'Calentar sartén con aceite en spray' },
      { step: 3, description: 'Añadir espinacas y saltear brevemente' },
      { step: 4, description: 'Verter las claras y cocinar' },
      { step: 5, description: 'Añadir queso y doblar' }
    ],
    tags: ['high-protein', 'low-calorie', 'quick', 'vegetarian'],
    featured: false
  }
];

const news = [
  {
    title: 'Los Beneficios de la Dieta Mediterránea',
    summary: 'Estudios recientes confirman que la dieta mediterránea reduce el riesgo de enfermedades cardíacas y mejora la longevidad.',
    content: `
      <p>La dieta mediterránea se ha posicionado como una de las más saludables del mundo, respaldada por décadas de investigación científica.</p>
      
      <h2>Beneficios principales:</h2>
      <ul>
        <li>Reducción del riesgo cardiovascular</li>
        <li>Control del peso corporal</li>
        <li>Mejora de la función cognitiva</li>
        <li>Reducción de la inflamación</li>
      </ul>
      
      <h2>Componentes clave:</h2>
      <p>Esta dieta se caracteriza por el alto consumo de aceite de oliva, frutas, verduras, legumbres, pescado y moderado consumo de vino tinto.</p>
      
      <p>Los expertos recomiendan adoptarla como estilo de vida permanente en lugar de una dieta temporal.</p>
    `,
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800',
    category: 'nutrition',
    author: {
      name: 'Dra. María García',
      avatar: 'https://i.pravatar.cc/150?img=47',
      role: 'Nutricionista Clínica'
    },
    tags: ['dieta', 'salud', 'longevidad'],
    readTime: 5,
    featured: true
  },
  {
    title: 'Proteína: Cuánto Realmente Necesitas',
    summary: 'Desmitificando los mitos sobre el consumo de proteína y estableciendo las cantidades recomendadas según tu objetivo.',
    content: `
      <p>La proteína es esencial para el crecimiento muscular, pero ¿cuánto necesitas realmente?</p>
      
      <h2>Recomendaciones generales:</h2>
      <ul>
        <li>Persona sedentaria: 0.8g/kg de peso corporal</li>
        <li>Actividad moderada: 1.2-1.4g/kg</li>
        <li>Atletas y culturistas: 1.6-2.2g/kg</li>
      </ul>
      
      <h2>Mejores fuentes:</h2>
      <p>Pollo, pescado, huevos, legumbres, tofu, yogur griego y quinoa son excelentes opciones.</p>
      
      <p>Recuerda que más no siempre es mejor. El exceso de proteína no se convierte automáticamente en músculo.</p>
    `,
    image: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800',
    category: 'fitness',
    author: {
      name: 'Carlos Rodríguez',
      avatar: 'https://i.pravatar.cc/150?img=12',
      role: 'Entrenador Personal'
    },
    tags: ['proteína', 'músculo', 'nutrición'],
    readTime: 6,
    featured: true
  },
  {
    title: 'Ayuno Intermitente: ¿Funciona para Todos?',
    summary: 'Análisis científico sobre los beneficios y limitaciones del ayuno intermitente como estrategia nutricional.',
    content: `
      <p>El ayuno intermitente ha ganado popularidad, pero es importante entender si es adecuado para ti.</p>
      
      <h2>Protocolos más comunes:</h2>
      <ul>
        <li>16/8: 16 horas de ayuno, 8 horas de alimentación</li>
        <li>5:2: 5 días normales, 2 días de restricción calórica</li>
        <li>Eat-Stop-Eat: 24 horas de ayuno 1-2 veces por semana</li>
      </ul>
      
      <h2>Beneficios potenciales:</h2>
      <p>Pérdida de peso, mejora de la sensibilidad a la insulina, autofagia celular y claridad mental.</p>
      
      <h2>No recomendado para:</h2>
      <p>Personas con historial de trastornos alimenticios, embarazadas, diabéticos sin supervisión médica.</p>
    `,
    image: 'https://images.unsplash.com/photo-1495195134817-aeb325a55b65?w=800',
    category: 'wellness',
    author: {
      name: 'Dr. Pedro Martínez',
      avatar: 'https://i.pravatar.cc/150?img=33',
      role: 'Médico Endocrinólogo'
    },
    tags: ['ayuno', 'dieta', 'pérdida de peso'],
    readTime: 7,
    featured: false
  }
];

// Función principal de seed
async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed de la base de datos...\n');

    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nutracore');
    console.log('✅ Conectado a MongoDB\n');

    // Limpiar colecciones existentes
    console.log('🗑️  Limpiando colecciones existentes...');
    await User.deleteMany({});
    await Dish.deleteMany({});
    await News.deleteMany({});
    await Recipe.deleteMany({});
    console.log('✅ Colecciones limpiadas\n');

    // Crear usuarios
    console.log('👤 Creando usuarios...');
    const createdUsers = await User.create(users);
    console.log(`✅ ${createdUsers.length} usuario(s) creado(s)\n`);

    // Crear platos
    console.log('🍽️  Creando platos...');
    const createdDishes = await Dish.create(dishes);
    console.log(`✅ ${createdDishes.length} plato(s) creado(s)\n`);

    // Crear noticias
    console.log('📰 Creando noticias...');
    const createdNews = await News.create(news);
    console.log(`✅ ${createdNews.length} noticia(s) creada(s)\n`);

    // Crear una receta de ejemplo para el usuario demo
    console.log('🧪 Creando receta de ejemplo...');
    const exampleRecipe = {
      user: createdUsers[0]._id,
      name: 'Mi Batido Post-Entreno',
      description: 'Receta personalizada para recuperación muscular',
      ingredients: [
        {
          name: 'Proteína Whey',
          amount: 30,
          unit: 'g',
          nutrition: { calories: 120, protein: 25, carbs: 3, fats: 2, fiber: 0 }
        },
        {
          name: 'Plátano',
          amount: 1,
          unit: 'unit',
          nutrition: { calories: 105, protein: 1, carbs: 27, fats: 0, fiber: 3 }
        },
        {
          name: 'Avena',
          amount: 40,
          unit: 'g',
          nutrition: { calories: 150, protein: 5, carbs: 27, fats: 3, fiber: 4 }
        }
      ],
      servings: 1,
      category: 'snack',
      notes: 'Tomar inmediatamente después del entrenamiento',
      tags: ['post-workout', 'high-protein']
    };
    
    await Recipe.create(exampleRecipe);
    console.log('✅ 1 receta creada\n');

    // Agregar algunos favoritos al usuario demo
    console.log('⭐ Agregando favoritos al usuario demo...');
    const user = createdUsers[0];
    user.favorites = [createdDishes[0]._id, createdDishes[1]._id];
    user.savedNews = [createdNews[0]._id];
    await user.save();
    console.log('✅ Favoritos agregados\n');

    // Resumen final
    console.log('═══════════════════════════════════════');
    console.log('🎉 SEED COMPLETADO EXITOSAMENTE\n');
    console.log('📊 Resumen:');
    console.log(`   • Usuarios: ${createdUsers.length}`);
    console.log(`   • Platos: ${createdDishes.length}`);
    console.log(`   • Noticias: ${createdNews.length}`);
    console.log(`   • Recetas: 1`);
    console.log('\n👤 Usuario demo creado:');
    console.log(`   • Email: demo@nutracore.com`);
    console.log(`   • Contraseña: demo123`);
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
  } finally {
    // Desconectar
    await mongoose.connection.close();
    console.log('✅ Desconectado de MongoDB');
    process.exit(0);
  }
}

// Ejecutar seed
seedDatabase();
