import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Clock, TrendingUp, BookOpen, Search, Calendar, ArrowRight, ImageOff } from "lucide-react";
import { getCloudinaryStaticAsset } from "../config/cloudinaryStaticAssets";
import { useNotification } from "../context/NotificationContext";
import { subscribeToNewsletter } from "../services/newsService";
import { isEmailLocalPartTooLong, validateEmailAddress } from "../utils/emailValidation";

const newsArticles = [
  {
    id: 1,
    title: "Estas son las verduras que no pueden faltar en tu lista de la compra este mes",
    excerpt:
      "Las verduras de temporada no solo son más económicas y sostenibles, también aportan vitaminas, fibra y nutrientes esenciales para mantener una alimentación equilibrada. Descubre cuáles no deberían faltar en tu cocina esta primavera.",
    category: "Alimentación saludable",
    image: getCloudinaryStaticAsset("/images/news/news-1.jpg"),
    date: "8 de mayo de 2026",
    readTime: 4,
    isFeatured: true,
    intro:
      "Las verduras no deben reservarse únicamente para momentos puntuales o dietas específicas. Los expertos insisten en que forman parte esencial de una alimentación saludable y equilibrada, por lo que deberían estar presentes cada día en nuestras comidas y cenas, e incluso en desayunos o tentempiés.",
    sections: [
      {
        heading: "Contexto de temporada",
        paragraphs: [
          "Con la llegada de la primavera, abril y mayo traen una gran variedad de verduras de temporada que destacan por su sabor, frescura y beneficios nutricionales.",
          "Además, apostar por productos de temporada y de proximidad también ayuda a reducir el impacto ambiental y favorece la economía local.",
          "Según explica Patricia L. Vilca Salazar, dietista-nutricionista del Grupo de Trabajo de Dietoterapia de la Sociedad Española para el Estudio de la Obesidad (Seedo), lo importante es incorporar frutas y verduras de forma **habitual** y no solo cuando estamos a dieta."
        ]
      },
      {
        heading: "¿Por qué consumir verduras a diario?",
        paragraphs: [
          "Las verduras aportan nutrientes esenciales como **vitaminas**, **minerales**, **fibra** y compuestos antioxidantes que ayudan a mantener el organismo en buen estado.",
          "Su consumo habitual se relaciona con beneficios como:"
        ],
        bullets: [
          "Reducción del riesgo de enfermedades cardiovasculares.",
          "Mejora del tránsito intestinal y prevención del estreñimiento.",
          "Ayuda en el control del peso y la obesidad.",
          "Posible efecto protector frente a algunos tipos de cáncer."
        ]
      },
      {
        heading: "Verduras de temporada en abril y mayo",
        paragraphs: ["Durante estas semanas es posible encontrar en el mercado verduras **frescas** y llenas de nutrientes como:"],
        bullets: [
          "Espárragos",
          "Guisantes",
          "Berenjena",
          "Alcachofas",
          "Puerro",
          "Judías verdes",
          "Habas",
          "Pepino",
          "Acelga",
          "Espinaca",
          "Endivia",
          "Zanahoria",
          "Remolacha",
          "Lechuga",
          "Brócoli",
          "Coliflor",
          "Col",
          "Rábano"
        ]
      },
      {
        heading: "Beneficios de algunas verduras destacadas",
        bullets: [
          "Espárragos, alcachofas, guisantes y habas: ricos en fibra, folatos y compuestos prebióticos que favorecen la salud digestiva y metabólica.",
          "Brócoli, coliflor y col: contienen glucosinolatos y compuestos sulfurados con potencial protector frente a ciertos tipos de cáncer.",
          "Pepino y endivia: destacan por su elevado contenido en agua y minerales.",
          "Zanahoria y remolacha: la zanahoria aporta betacarotenos y vitamina A, mientras que la remolacha contiene nitratos beneficiosos para la salud vascular.",
          "Verduras de hoja verde: espinacas, acelgas y lechuga son fuente de vitamina K y folato, importantes para la salud ósea y celular."
        ]
      },
      {
        heading: "Ideas para incluir más verduras en tu dieta",
        paragraphs: [
          "La primavera es una época ideal para preparar ensaladas frescas, sopas frías y platos ligeros.",
          "Los expertos recomiendan combinar hojas verdes con frutas de temporada como fresas o frambuesas, añadiendo también aguacate o legumbres para conseguir platos más completos y nutritivos.",
          "Además de verduras y frutas, una alimentación equilibrada debe incluir legumbres, cereales integrales y proteínas magras como pescado, ave o conejo."
        ]
      }
    ],
    sourceLabel: "CuidatePlus (Marca)",
    sourceUrl:
      "https://cuidateplus.marca.com/alimentacion/nutricion/2026/04/26/son-verduras-faltar-lista-compra-mes-185000.html"
  },
  {
    id: 2,
    title: "Estas son las frutas de temporada que han llegado en abril",
    excerpt:
      "La primavera trae nuevas frutas de temporada llenas de sabor, vitaminas y nutrientes esenciales. Descubre cuáles son las mejores opciones de abril y qué beneficios aportan a tu salud.",
    category: "Nutrición",
    image: "/images/news/news-2.jpg",
    date: "8 de mayo de 2026",
    readTime: 4,
    isFeatured: true,
    intro:
      "Con la llegada de la primavera, los mercados comienzan a llenarse de nuevas frutas de temporada que destacan por su sabor, frescura y valor nutricional. Elegir frutas propias de cada estación no solo mejora la calidad de la alimentación, también favorece un consumo más sostenible y respetuoso con el medio ambiente.",
    sections: [
      {
        heading: "Contexto y recomendaciones",
        paragraphs: [
          "La Agencia Española de Seguridad Alimentaria y Nutrición (Aesan) recuerda que consumir productos de temporada significa apostar por alimentos con mejor sabor, mayor calidad nutricional y menor impacto ambiental.",
          "Los expertos recomiendan tomar al menos tres piezas de fruta al día y variar las opciones para conseguir una alimentación equilibrada y rica en nutrientes.",
          "Además, dentro de la dieta mediterránea, la fruta se considera uno de los postres más saludables gracias a su capacidad para aportar saciedad y reducir el deseo de consumir dulces."
        ]
      },
      {
        heading: "Frutas de temporada en abril",
        paragraphs: ["Estas son algunas de las frutas protagonistas durante el mes de abril:"],
        bullets: [
          "Aguacate",
          "Frambuesa",
          "Fresa",
          "Kiwi",
          "Limón",
          "Naranja",
          "Níspero",
          "Plátano"
        ]
      },
      {
        heading: "Aguacate",
        paragraphs: [
          "Aunque muchas personas lo consideran una verdura, el aguacate es realmente una fruta. Destaca por su contenido en grasas saludables monoinsaturadas, similares a las del aceite de oliva virgen extra.",
          "Además, aporta vitamina C, vitamina E, vitamina B6, ácido fólico, fibra y minerales como potasio y magnesio, convirtiéndose en un alimento muy completo para incluir en desayunos, ensaladas o tostadas."
        ]
      },
      {
        heading: "Frambuesa",
        paragraphs: [
          "La frambuesa es una fruta rica en vitamina C y antioxidantes. Una sola porción puede aportar hasta el 80% de la cantidad diaria recomendada de esta vitamina.",
          "También contiene fibra, folatos y compuestos fenólicos, además de tener un índice glucémico bajo, lo que la convierte en una opción saludable para todo tipo de dietas."
        ]
      },
      {
        heading: "Fresa",
        paragraphs: [
          "Abril es uno de los mejores meses para disfrutar de las fresas en su punto óptimo. A pesar de su pequeño tamaño, destacan por su alto contenido en vitamina C, incluso superior al de algunas naranjas.",
          "Son bajas en calorías y contienen ácidos orgánicos como el cítrico, málico y oxálico, además de pequeñas cantidades de ácido salicílico."
        ]
      },
      {
        heading: "Kiwi",
        paragraphs: [
          "El kiwi es conocido por favorecer el tránsito intestinal gracias a su contenido en fibra. También destaca por su elevada cantidad de vitamina C y vitamina K.",
          "Además, los expertos señalan que consumirlo con piel aumenta aún más el aporte de fibra, antioxidantes y polifenoles."
        ]
      },
      {
        heading: "Níspero",
        paragraphs: [
          "El níspero marca el inicio de la temporada de frutas con hueso. Se caracteriza por ser una de las frutas con mayor contenido en fibra y por aportar potasio, un mineral importante para el funcionamiento muscular y nervioso."
        ]
      },
      {
        heading: "Naranja",
        paragraphs: [
          "La naranja encara el final de su temporada, aunque sigue siendo una excelente fuente de vitamina C. También aporta flavonoides, folatos y ácidos orgánicos beneficiosos para el organismo."
        ]
      },
      {
        heading: "Plátano",
        paragraphs: [
          "El plátano sigue siendo una de las frutas más consumidas gracias a su practicidad y valor energético. Contiene potasio, vitamina C, fósforo y triptófano, además de ser rico en hidratos de carbono, lo que lo convierte en una opción ideal para deportistas o para comenzar el día con energía."
        ]
      }
    ],
    sourceLabel: "AESAN y Fundación Española de Nutrición (FEN)",
    sourceUrl: "https://www.aesan.gob.es"
  },
  {
    id: 7,
    title: "La ensalada proteica que ayuda a adelgazar sin pasar hambre",
    excerpt:
      "Una ensalada rica en proteínas y fibra se ha convertido en tendencia por su capacidad para saciar y ayudar a mantener el déficit calórico. Lo mejor es que se prepara en pocos minutos y admite múltiples combinaciones.",
    category: "Pérdida de peso",
    image: "/images/news/news-3.jpg",
    date: "8 de mayo de 2026",
    readTime: 3,
    isFeatured: false,
    intro:
      "Encontrar recetas saludables, rápidas y realmente saciantes puede parecer complicado al empezar una dieta. Sin embargo, algunos platos consiguen combinar facilidad, sabor y un buen equilibrio nutricional. Es el caso de una ensalada proteica que se ha vuelto popular en redes sociales gracias a su capacidad para ayudar a adelgazar sin pasar hambre.",
    sections: [
      {
        heading: "Un plato viral para perder peso sin hambre",
        paragraphs: [
          "El creador de contenido especializado en pérdida de peso @maydesito ha compartido una receta basada en alimentos ricos en proteínas y fibra, diseñada para aumentar la sensación de saciedad y facilitar el mantenimiento del déficit calórico.",
          "“Comes hasta llenarte y aún así sigues bajando de peso”, asegura el influencer, que apuesta por platos con mucho volumen y pocas calorías."
        ]
      },
      {
        heading: "Una salsa ligera y fácil de preparar",
        paragraphs: [
          "La receta comienza con un aliño sencillo elaborado con yogur griego bajo en grasa. Para prepararlo solo hace falta mezclar:",
          "El resultado es una salsa cremosa que aporta sabor sin añadir demasiadas calorías."
        ],
        bullets: ["Yogur griego ligero", "Mostaza", "Sal", "Orégano"]
      },
      {
        heading: "Ingredientes ricos en fibra y proteína",
        paragraphs: [
          "La ensalada incorpora diferentes verduras y alimentos frescos que ayudan a aumentar el volumen del plato y mejorar la saciedad:",
          "Uno de los trucos de la receta consiste en triturar parte de los ingredientes para conseguir una mezcla más homogénea y fácil de comer.",
          "Después, se añaden judías cocidas y una fuente de proteína al gusto, como pollo, atún o pavo."
        ],
        bullets: ["Huevo", "Cebolla morada", "Pepinillos", "Zanahoria", "Pimientos"]
      },
      {
        heading: "¿Por qué puede ayudar a perder peso?",
        paragraphs: [
          "Los expertos en nutrición coinciden en que las comidas ricas en proteína y fibra ayudan a controlar mejor el apetito y reducen la necesidad de picar entre horas.",
          "Además, las legumbres y verduras aportan gran cantidad de nutrientes con un contenido calórico relativamente bajo, lo que permite crear platos abundantes sin excederse en calorías.",
          "El resultado es una comida rápida, completa y fácil de adaptar a distintos gustos y objetivos nutricionales."
        ]
      }
    ],
    sourceLabel: "La Razón",
    sourceUrl:
      "https://www.larazon.es/salud/bienestar/ensalada-definitiva-pueden-adelgazar-muchos-kilos-puedes-comerla-llenarte-bajaras-peso-b50m_2026050869fdd886b5b066299608e1a3.html?utm_source=chatgpt.com"
  },
  {
    id: 8,
    title: "Vacaciones saludables: consejos para mantenerse activo y comer bien",
    excerpt:
      "Mantener hábitos saludables durante las vacaciones es posible con pequeños cambios en la rutina. Actividad física, alimentación equilibrada y descanso adecuado son claves para disfrutar más y volver con energía renovada.",
    category: "Bienestar",
    image: "/images/news/news-4.jpg",
    date: "8 de mayo de 2026",
    readTime: 5,
    isFeatured: false,
    intro:
      "Las vacaciones son el momento ideal para desconectar de la rutina, descansar y disfrutar del tiempo libre. Sin embargo, también suelen venir acompañadas de cambios en los hábitos diarios que pueden afectar a la alimentación, el descanso y la actividad física.",
    sections: [
      {
        heading: "Disfrutar y cuidarse al mismo tiempo",
        paragraphs: [
          "Mantener un estilo de vida saludable durante este periodo no significa renunciar al ocio ni seguir normas estrictas. Con pequeños gestos y una planificación sencilla es posible disfrutar plenamente de las vacaciones mientras se cuida la salud y el bienestar."
        ]
      },
      {
        heading: "¿Por qué es importante cuidarse también en vacaciones?",
        paragraphs: [
          "Mantener hábitos saludables durante los días de descanso aporta beneficios tanto físicos como mentales:",
          "Además, diferentes estudios señalan que las personas que conservan rutinas saludables durante las vacaciones suelen experimentar una mayor sensación de bienestar y satisfacción general."
        ],
        bullets: [
          "Ayuda a evitar el aumento de peso.",
          "Mejora los niveles de energía.",
          "Reduce el estrés al volver a la rutina.",
          "Facilita mantener hábitos positivos a largo plazo."
        ]
      },
      {
        heading: "Cómo mantenerse activo durante las vacaciones",
        paragraphs: [
          "No hace falta seguir entrenamientos intensos para mantenerse en movimiento durante los días libres. La clave está en integrar la actividad física en los planes diarios."
        ]
      },
      {
        heading: "Aprovecha para caminar más",
        paragraphs: [
          "Explorar ciudades, pasear por la playa o recorrer rutas naturales caminando permite mantenerse activo casi sin darse cuenta."
        ]
      },
      {
        heading: "Practica actividades al aire libre",
        paragraphs: [
          "El verano y el buen tiempo son ideales para realizar deportes como:",
          "El ejercicio al aire libre se relaciona con una mejora del estado de ánimo y una reducción del estrés."
        ],
        bullets: ["Natación", "Surf", "Paddle surf", "Senderismo", "Ciclismo"]
      },
      {
        heading: "Utiliza las instalaciones del alojamiento",
        paragraphs: [
          "Muchos hoteles cuentan con gimnasio o piscina. Dedicar unos minutos al día a moverse puede marcar la diferencia."
        ]
      },
      {
        heading: "Consejos para comer de forma saludable",
        paragraphs: [
          "Las vacaciones también son una oportunidad para disfrutar de la gastronomía, pero mantener cierto equilibrio ayuda a sentirse mejor durante el viaje."
        ]
      },
      {
        heading: "Prioriza desayunos completos",
        paragraphs: [
          "Incluir proteínas, fruta y alimentos ricos en fibra ayuda a mantener la saciedad durante más tiempo."
        ]
      },
      {
        heading: "Lleva snacks saludables",
        paragraphs: [
          "Frutos secos, fruta fresca o yogures son alternativas sencillas para evitar recurrir constantemente a comida rápida o ultraprocesados."
        ]
      },
      {
        heading: "Mantente hidratado",
        paragraphs: [
          "Beber suficiente agua es especialmente importante en destinos cálidos o durante actividades al aire libre."
        ]
      },
      {
        heading: "Disfruta de la comida local con moderación",
        paragraphs: [
          "Probar platos típicos forma parte de la experiencia de viajar. La recomendación es hacerlo sin excesos y priorizando opciones más ligeras, como preparaciones al horno, plancha o vapor."
        ]
      },
      {
        heading: "Descanso y bienestar emocional",
        paragraphs: ["El descanso también forma parte de una vida saludable."]
      },
      {
        heading: "Cuida las horas de sueño",
        paragraphs: [
          "Intentar mantener horarios relativamente estables y crear un entorno cómodo para dormir ayuda a mejorar el descanso."
        ]
      },
      {
        heading: "Dedica tiempo a relajarte",
        paragraphs: [
          "Leer, practicar mindfulness o simplemente desconectar del móvil puede contribuir a reducir el estrés y mejorar el bienestar emocional."
        ]
      },
      {
        heading: "Consejos para viajes largos",
        paragraphs: [
          "En trayectos de muchas horas conviene levantarse, caminar y hacer pequeños estiramientos siempre que sea posible. También es recomendable llevar agua y snacks saludables para evitar recurrir constantemente a productos poco saludables."
        ]
      },
      {
        heading: "La tecnología también puede ayudar",
        paragraphs: [
          "Actualmente existen aplicaciones móviles que permiten registrar actividad física, controlar hábitos saludables o practicar meditación guiada, herramientas que pueden ser útiles para mantener una rutina equilibrada incluso durante las vacaciones.",
          "Mantener hábitos saludables en vacaciones no implica perder libertad ni dejar de disfrutar. Al contrario, encontrar un equilibrio entre descanso, actividad física y buena alimentación puede ayudar a aprovechar mejor el tiempo libre y regresar con más energía."
        ]
      }
    ],
    sourceLabel: "Clínic Barcelona",
    sourceUrl: "https://www.clinicbarcelona.org/noticias/vacaciones-saludables-consejos-para-mantenerse-activo-y-comer-bien?utm_source=chatgpt.com"
  },
  {
    id: 9,
    title: "Consejos para elaborar un menú saludable y equilibrado",
    excerpt:
      "Planificar las comidas y apostar por alimentos frescos y variados son algunas de las claves para seguir una alimentación saludable. Descubre cómo organizar un menú equilibrado fácil de mantener en el día a día.",
    category: "Alimentación saludable",
    image: "/images/news/news-5.jpg",
    date: "8 de mayo de 2026",
    readTime: 5,
    isFeatured: false,
    intro:
      "Seguir una alimentación saludable no consiste únicamente en comer menos o evitar determinados alimentos. La clave está en mantener una dieta equilibrada, variada y adaptada a las necesidades de cada persona.",
    sections: [
      {
        heading: "Base de una alimentación saludable",
        paragraphs: [
          "Los expertos recuerdan que una buena alimentación puede ayudar a prevenir enfermedades como obesidad, diabetes, hipertensión, problemas cardiovasculares e incluso algunos tipos de cáncer. Sin embargo, organizar un menú saludable no siempre resulta sencillo, especialmente cuando influyen factores como el tiempo, las costumbres o el presupuesto."
        ]
      },
      {
        heading: "¿Qué debe tener una alimentación saludable?",
        paragraphs: [
          "Una dieta equilibrada debe reunir varias características fundamentales para aportar todos los nutrientes necesarios y poder mantenerse en el tiempo."
        ]
      },
      {
        heading: "Equilibrada",
        paragraphs: [
          "Debe aportar proteínas, hidratos de carbono, grasas saludables, vitaminas y minerales en proporciones adecuadas según la edad, el estilo de vida y las necesidades de cada persona."
        ]
      },
      {
        heading: "Suficiente",
        paragraphs: [
          "La cantidad de alimentos debe cubrir las necesidades energéticas diarias sin excesos ni carencias."
        ]
      },
      {
        heading: "Variada",
        paragraphs: [
          "Incluir diferentes grupos de alimentos ayuda a garantizar el aporte completo de nutrientes esenciales."
        ]
      },
      {
        heading: "Apetitosa",
        paragraphs: [
          "La alimentación saludable también debe resultar agradable y sabrosa para favorecer la adherencia a largo plazo."
        ]
      },
      {
        heading: "Sostenible",
        paragraphs: [
          "Elegir productos locales y de temporada ayuda a reducir el impacto ambiental y puede resultar más económico."
        ]
      },
      {
        heading: "Alimentos clave en un menú saludable",
        paragraphs: ["Una alimentación equilibrada suele incluir:"],
        bullets: [
          "Verduras y hortalizas",
          "Frutas",
          "Cereales integrales",
          "Legumbres",
          "Frutos secos",
          "Aceite de oliva virgen extra",
          "Pescados y mariscos",
          "Huevos",
          "Lácteos",
          "Carnes blancas"
        ]
      },
      {
        heading: "Más sabor con menos exceso",
        paragraphs: [
          "Además, las especias y hierbas aromáticas permiten potenciar el sabor de los platos reduciendo el uso de sal y azúcar."
        ]
      },
      {
        heading: "Cómo organizar un menú semanal saludable",
        paragraphs: [
          "Planificar las comidas es una de las herramientas más eficaces para mejorar la alimentación y evitar improvisaciones."
        ]
      },
      {
        heading: "Planifica las comidas principales",
        paragraphs: [
          "Diseñar un menú semanal facilita la compra y ayuda a mantener una alimentación más equilibrada."
        ]
      },
      {
        heading: "Mantén horarios regulares",
        paragraphs: [
          "Organizar los horarios de desayuno, comida y cena puede ayudar a evitar el picoteo entre horas."
        ]
      },
      {
        heading: "Ten opciones saludables a mano",
        paragraphs: [
          "Fruta, yogures naturales o frutos secos son alternativas sencillas para momentos de hambre inesperados."
        ]
      },
      {
        heading: "Prioriza el agua",
        paragraphs: [
          "El agua debe ser la bebida principal. También puede tomarse con limón, menta o en forma de infusión."
        ]
      },
      {
        heading: "Comer saludable también puede ser económico",
        paragraphs: [
          "Contrariamente a lo que muchas personas creen, comer sano no tiene por qué ser más caro.",
          "Comprar productos de temporada y proximidad suele abaratar el coste de la cesta de la compra y mejora la calidad de los alimentos. Además, aprovechar las sobras y reutilizar ingredientes ayuda a reducir el desperdicio alimentario."
        ]
      },
      {
        heading: "Ejemplo de menú saludable diario",
        paragraphs: [],
        bullets: [
          "Desayuno: Café con leche, pan integral con tomate y aceite de oliva virgen extra, naranja.",
          "Media mañana: Yogur natural.",
          "Comida: Ensalada verde, paella de pescado, uvas, pan integral opcional.",
          "Merienda: Nueces.",
          "Cena: Escalivada, tortilla de patatas, pera, pan integral opcional."
        ]
      },
      {
        heading: "Una rutina asumible",
        paragraphs: [
          "Adoptar hábitos saludables no requiere seguir dietas estrictas, sino aprender a organizar mejor las comidas y priorizar alimentos frescos y nutritivos en el día a día."
        ]
      }
    ],
    sourceLabel: "Clínic Barcelona",
    sourceUrl: "https://www.clinicbarcelona.org/noticias/consejos-para-elaborar-un-menu-saludable?utm_source=chatgpt.com"
  },
  {
    id: 10,
    title: "Estos son los cereales de Mercadona más ricos en proteínas y fibra",
    excerpt:
      "Un nutricionista analiza los cereales de Mercadona y desvela cuáles destacan por su contenido en fibra y proteínas, además de señalar las opciones menos recomendables por su exceso de azúcar.",
    category: "Nutrición",
    image: "/images/news/news-6.jpg",
    date: "8 de mayo de 2026",
    readTime: 5,
    isFeatured: false,
    intro:
      "Elegir unos cereales saludables en el supermercado no siempre es sencillo. Muchos productos que parecen equilibrados esconden altas cantidades de azúcar y pocos nutrientes saciantes. Por eso, cada vez más nutricionistas analizan los productos más populares para ayudar a los consumidores a tomar mejores decisiones.",
    sections: [
      {
        heading: "Qué analiza el nutricionista",
        paragraphs: [
          "El nutricionista Yeray Moreno ha revisado varios cereales de Mercadona centrándose especialmente en tres aspectos clave: contenido en proteínas, cantidad de fibra y niveles de azúcar."
        ]
      },
      {
        heading: "Los cereales menos recomendables",
        paragraphs: [
          "Entre los productos que el experto aconseja limitar destacan algunos cereales especialmente populares entre los más pequeños."
        ]
      },
      {
        heading: "Cereales rellenos",
        paragraphs: [
          "Los cereales rellenos contienen alrededor de 37 gramos de azúcar por cada 100 gramos de producto, además de aceites refinados como palma, girasol o nabina.",
          "Aunque aportan algo de proteína, su bajo contenido en fibra y su elevada cantidad de azúcar hacen que no sean una opción recomendable para el desayuno habitual."
        ]
      },
      {
        heading: "Cereales de chocolate y avellana",
        paragraphs: [
          "Las versiones de chocolate y avellana también aparecen entre las menos saludables debido a su exceso de azúcar y presencia de aditivos."
        ]
      },
      {
        heading: "Cereales sin gluten de cacao y avellana",
        paragraphs: [
          "Según el nutricionista, estos cereales resultan pobres en proteína y fibra, además de poco saciantes."
        ]
      },
      {
        heading: "Los cereales mejor valorados",
        paragraphs: [
          "Tras analizar diferentes productos, Yeray Moreno destaca varias opciones que pueden encajar mejor dentro de una alimentación equilibrada."
        ]
      },
      {
        heading: "Copos de avena con chocolate",
        paragraphs: [
          "Estos cereales destacan por su equilibrio entre proteína y fibra:",
          "Sin embargo, también contienen más de 10 gramos de azúcar, por lo que conviene consumirlos con moderación."
        ],
        bullets: ["10,8 gramos de proteína", "10,8 gramos de fibra"]
      },
      {
        heading: "Muesli Crunchy 0% azúcares añadidos",
        paragraphs: [
          "Una de las opciones favoritas del experto gracias a su alto contenido en fibra y bajo nivel de azúcar.",
          "Aporta:"
        ],
        bullets: ["23 gramos de fibra", "8,8 gramos de proteína", "Solo 3,2 gramos de azúcar"]
      },
      {
        heading: "Corn Flakes 0% azúcar",
        paragraphs: [
          "Estos cereales destacan por su sencillez en ingredientes y su mínimo contenido en azúcar.",
          "Están elaborados principalmente con maíz y apenas contienen:"
        ],
        bullets: ["0,7 gramos de azúcar", "4,4 gramos de fibra", "6,7 gramos de proteína"]
      },
      {
        heading: "Cereales 0% azúcares",
        paragraphs: [
          "Otra alternativa interesante para quienes buscan reducir el consumo de azúcar sin renunciar a un desayuno rápido.",
          "El nutricionista destaca su buen aporte de proteína y fibra, aunque señala ciertas dudas sobre el etiquetado de ingredientes y porcentajes indicados en el envase."
        ]
      },
      {
        heading: "Fibra Sticks",
        paragraphs: [
          "Los Fibra Sticks son de los productos con mayor contenido en fibra del análisis:"
        ],
        bullets: ["33 gramos de fibra", "16 gramos de proteína", "Aunque también contienen unos 10 gramos de azúcar, siguen siendo una de las opciones más saciantes."]
      },
      {
        heading: "Espelta 0% azúcar añadido",
        paragraphs: [
          "Los cereales de espelta integral destacan por su composición sencilla y equilibrada.",
          "Entre sus ingredientes principales figuran:"
        ],
        bullets: ["Harina integral de espelta", "Cebada", "Sal", "Además, ofrecen una buena combinación de proteína y fibra con un contenido moderado en azúcar."]
      },
      {
        heading: "Copos de avena: la opción más recomendable",
        paragraphs: [
          "Para el nutricionista, los copos de avena son la mejor alternativa del supermercado por su perfil nutricional.",
          "Aportan:"
        ],
        bullets: [
          "14 gramos de proteína",
          "10 gramos de fibra",
          "Solo 0,7 gramos de azúcar",
          "Además, no contienen aditivos innecesarios y pueden combinarse fácilmente con fruta, yogur o frutos secos para conseguir un desayuno más completo."
        ]
      }
    ],
    sourceLabel: "The Objective",
    sourceUrl: "https://theobjective.com/lifestyle/nutricion/2026-04-06/yeray-moreno-nutricionista-estos-son-cereales-mercadona-ricos-proteinas-fibra/"
  }
];

const categories = ["Todos", "Alimentación saludable", "Nutrición", "Fitness", "Bienestar", "Planificación", "Pérdida de peso"];

const PixelX = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 8 8" fill="currentColor" className={className} aria-hidden="true">
    <path d="M0 0h1v1H0V0zm1 1h1v1H1V1zm1 1h1v1H2V2zm1 1h1v1H3V3zm1 1h1v1H4V4zm1 1h1v1H5V5zm1 1h1v1H6V6zm1 1h1v1H7V7zM0 7h1v1H0V7zm1-1h1v1H1V6zm1-1h1v1H2V5zm1-1h1v1H3V4zm2-2h1v1H5V2zm1-1h1v1H6V1zm1-1h1v1H7V0z" />
  </svg>
);

function NewsImage({ src, alt, featured = false }) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-white text-slate-500">
        <div className="flex flex-col items-center gap-2 text-center">
          <ImageOff className="h-8 w-8" aria-hidden="true" />
          <span className={`font-medium ${featured ? "text-base" : "text-sm"}`}>Imagen no disponible</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setImageError(true)}
      className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
    />
  );
}

export function News() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleNewsletterEmailChange = (value) => {
    if (isEmailLocalPartTooLong(value)) {
      return;
    }

    setNewsletterEmail(value);
  };

  const handleNewsletterSubscribe = async () => {
    const { isValid, normalizedEmail, error } = validateEmailAddress(newsletterEmail);

    if (!isValid) {
      showNotification(error || "Introduce un correo valido", "error");
      return;
    }

    try {
      setNewsletterLoading(true);
      const response = await subscribeToNewsletter(normalizedEmail);
      showNotification(response?.message || "Suscripcion registrada", "success");
      setNewsletterEmail("");
    } catch (error) {
      showNotification(error.message || "No se pudo registrar la suscripcion", "error");
    } finally {
      setNewsletterLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedArticle) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedArticle(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedArticle]);

  const openArticle = (article) => {
    setSelectedArticle(article);
  };

  const renderFormattedText = (text) => {
    if (!text) return null;
    const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={`strong-${index}`} className="font-bold text-gray-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={`text-${index}`}>{part}</span>;
    });
  };

  const filteredArticles = newsArticles.filter((article) => {
    const matchesCategory = selectedCategory === "Todos" || article.category === selectedCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredArticles = filteredArticles.filter((a) => a.isFeatured);
  const regularArticles = filteredArticles;

  return (
    <div className="min-h-screen bg-gray-50 dark-pink-fields">
      <div className="pt-24 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          <Card className="p-4 sm:p-6 md:p-8 bg-white border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] rounded-none">
            <h1 className="mb-2 text-2xl text-gray-900 sm:text-3xl lg:text-4xl">Noticias y Artículos</h1>
            <p className="text-gray-600">
              Las últimas novedades sobre nutrición, fitness y bienestar respaldadas por evidencia científica.
            </p>
          </Card>

          <Card className="p-4 sm:p-5 bg-white border-2 border-pink-accent shadow-[6px_6px_0px_0px_#ff0a60] rounded-none space-y-3 sm:space-y-4">
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar artículos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 sm:h-12 text-sm border-2 border-gray-300 rounded-none focus-visible:border-pink-accent bg-white"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`news-category-badge ${category === "Todos" ? "news-category-badge-all" : ""} cursor-pointer px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm transition-colors rounded-none border-2 ${
                    selectedCategory === category
                      ? "bg-pink-accent border-pink-accent text-white"
                      : "border-gray-900 text-gray-900"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </Card>

          {featuredArticles.length > 0 && (
            <div className="mb-8 sm:mb-12">
              <div className="mb-4 sm:mb-6 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-pink-accent" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Artículos destacados</h2>
              </div>

              <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                {featuredArticles.map((article) => (
                  <Card
                    key={article.id}
                    data-news-card
                    className="news-card-large overflow-hidden group flex flex-col bg-white border-2 border-gray-200 rounded-none shadow-[4px_4px_0px_0px_#d1d5db] hover:shadow-[8px_8px_0px_0px_#ff0a60] hover:border-pink-accent transition-all"
                    role="button"
                    tabIndex={0}
                    onClick={() => openArticle(article)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openArticle(article);
                      }
                    }}
                  >
                    <div className="relative overflow-hidden aspect-[16/9] sm:aspect-[16/10]">
                      <NewsImage src={article.image} alt={article.title} featured />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <Badge className="absolute top-4 left-4 bg-pink-accent text-white rounded-none border border-pink-accent pointer-events-none dark:border-pink-accent">
                        {article.category}
                      </Badge>
                    </div>

                    <div className="flex flex-1 flex-col p-3 sm:p-4 lg:p-5 space-y-3">
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 group-hover:text-pink-accent transition-colors line-clamp-3 min-h-[4.2rem] sm:min-h-[5.4rem]">
                        {article.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-4 min-h-[5.2rem] sm:min-h-[6.4rem]">{article.excerpt}</p>

                      <div className="mt-auto flex flex-col gap-3 border-t border-gray-100 pt-4 min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{article.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{article.readTime} min</span>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          className="news-ghost-btn rounded-none text-pink-accent hover:text-pink-accent/80 hover:bg-pink-50 dark:hover:bg-pink-500/12 dark:hover:text-pink-200 active:scale-[0.98]"
                          onClick={(event) => {
                            event.stopPropagation();
                            openArticle(article);
                          }}
                        >
                          Leer más
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {regularArticles.length > 0 && (
            <div>
              <div className="mb-4 sm:mb-6 flex items-center gap-2">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-pink-accent" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Todas las noticias</h2>
              </div>

              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {regularArticles.map((article) => (
                  <Card
                    key={article.id}
                    data-news-card
                    className="news-card-small overflow-hidden group flex flex-col bg-white border-2 border-gray-200 rounded-none shadow-[4px_4px_0px_0px_#d1d5db] hover:shadow-[8px_8px_0px_0px_#ff0a60] hover:border-pink-accent transition-all"
                    role="button"
                    tabIndex={0}
                    onClick={() => openArticle(article)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openArticle(article);
                      }
                    }}
                  >
                    <div className="relative overflow-hidden aspect-[16/10]">
                      <NewsImage src={article.image} alt={article.title} />
                      <Badge className="absolute top-4 left-4 bg-pink-accent text-white rounded-none border border-pink-accent pointer-events-none">
                        {article.category}
                      </Badge>
                    </div>

                    <div className="flex flex-1 flex-col p-3 sm:p-4 space-y-2.5">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-pink-accent transition-colors line-clamp-3 min-h-[3.8rem] sm:min-h-[4.7rem]">
                        {article.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-4 min-h-[4.8rem] sm:min-h-[6rem]">{article.excerpt}</p>

                      <div className="mt-auto flex flex-col gap-3 border-t border-gray-100 pt-3 min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{article.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{article.readTime} min</span>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="news-ghost-btn rounded-none text-pink-accent hover:text-pink-accent/80 hover:bg-pink-50 dark:hover:bg-pink-500/12 dark:hover:text-pink-200 active:scale-[0.98]"
                          onClick={(event) => {
                            event.stopPropagation();
                            openArticle(article);
                          }}
                        >
                          Leer
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {filteredArticles.length === 0 && (
            <Card className="text-center py-16 bg-white border-2 border-pink-accent shadow-[6px_6px_0px_0px_#ff0a60] rounded-none">
              <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-300">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron artículos</h3>
              <p className="text-gray-600 mb-6">Intenta con otros términos de búsqueda o cambia la categoría.</p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("Todos");
                }}
                className="bg-pink-accent hover:bg-pink-accent/90 text-white rounded-none"
              >
                Ver todos los artículos
              </Button>
            </Card>
          )}

          <Card className="mt-10 sm:mt-16 p-5 sm:p-8 bg-white border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] rounded-none">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="mb-3 text-xl sm:text-2xl font-bold text-gray-900">Suscríbete a nuestro boletín</h3>
              <p className="text-gray-600 mb-6">
                Recibe los últimos artículos, recetas y consejos de nutrición directamente en tu correo.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={newsletterEmail}
                  onChange={(event) => handleNewsletterEmailChange(event.target.value)}
                  className="flex-1 border-2 border-gray-300 rounded-none focus-visible:border-pink-accent bg-white"
                />
                <Button
                  type="button"
                  onClick={handleNewsletterSubscribe}
                  disabled={newsletterLoading}
                  className="news-subscribe-btn w-full rounded-none bg-pink-accent text-white hover:bg-pink-accent/90 active:scale-[0.98] sm:w-auto dark:bg-pink-300 dark:text-slate-950 dark:hover:bg-pink-200"
                >
                  {newsletterLoading ? "Enviando..." : "Suscribirse"}
                </Button>
              </div>
              <p className="mt-3 text-xs text-gray-500">M?ximo 30 caracteres antes de @.</p>
            </div>
          </Card>

          {selectedArticle && (
            <div
              className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/40 modal-overlay-enter"
              onClick={() => setSelectedArticle(null)}
            >
              <Card
                key={selectedArticle.id}
                className="w-full max-w-4xl h-[calc(100vh-1.5rem)] sm:h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-2rem)] md:max-h-[calc(100vh-3rem)] overflow-y-auto bg-white border-2 border-pink-accent shadow-[10px_10px_0px_0px_#ff0a60] rounded-none modal-content-enter relative"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="relative">
                  <div className="aspect-[16/8] overflow-hidden border-b-2 border-pink-accent/40">
                    <NewsImage src={selectedArticle.image} alt={selectedArticle.title} featured />
                  </div>
                  <button
                    type="button"
                    aria-label="Cerrar artículo"
                    onClick={() => setSelectedArticle(null)}
                    className="absolute top-3 right-3 h-11 w-11 border-2 border-pink-accent/40 bg-white/95 text-pink-accent hover:bg-pink-50 hover:border-pink-accent transition-all duration-200 flex items-center justify-center rounded-full group hover:scale-105"
                  >
                    <PixelX size={18} className="text-pink-accent pixel-icon group-hover:text-pink-accent" />
                  </button>
                </div>

                <div className="space-y-6 p-4 sm:p-6 md:p-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-pink-accent text-white rounded-none">{selectedArticle.category}</Badge>
                    <span className="text-sm text-gray-500 inline-flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {selectedArticle.date}
                    </span>
                    <span className="text-sm text-gray-500 inline-flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {selectedArticle.readTime} min
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold leading-tight text-gray-900 md:text-3xl">{selectedArticle.title}</h3>

                  <div className="space-y-5 text-gray-700 leading-relaxed">
                    <p className="text-base md:text-lg text-gray-800">{renderFormattedText(selectedArticle.excerpt)}</p>

                    {selectedArticle.intro ? (
                      <Card className="p-4 border border-pink-accent/25 rounded-none bg-gray-50 shadow-[4px_4px_0px_0px_#ffe2ef]">
                        <p>{renderFormattedText(selectedArticle.intro)}</p>
                      </Card>
                    ) : null}

                    {Array.isArray(selectedArticle.sections) && selectedArticle.sections.length > 0 ? (
                      <div className="space-y-4">
                        {selectedArticle.sections.map((section, sectionIndex) => (
                          <Card key={`${selectedArticle.id}-section-${sectionIndex}`} className="p-0 border border-gray-200 rounded-none overflow-hidden">
                            <div className="grid grid-cols-[6px_1fr]">
                              <div className="bg-pink-accent" />
                              <div className="p-4 bg-white">
                            {section.heading ? (
                              <h4 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-pink-accent/25">{section.heading}</h4>
                            ) : null}
                            {Array.isArray(section.paragraphs)
                              ? section.paragraphs.map((paragraph, paragraphIndex) => (
                                  <p key={`${selectedArticle.id}-section-${sectionIndex}-paragraph-${paragraphIndex}`} className="mb-2 last:mb-0">
                                    {renderFormattedText(paragraph)}
                                  </p>
                                ))
                              : null}
                            {Array.isArray(section.bullets) && section.bullets.length > 0 ? (
                              <ul className="list-disc pl-5 space-y-1 marker:text-pink-accent">
                                {section.bullets.map((item, itemIndex) => (
                                  <li key={`${selectedArticle.id}-section-${sectionIndex}-bullet-${itemIndex}`}>{renderFormattedText(item)}</li>
                                ))}
                              </ul>
                            ) : null}
                          </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : Array.isArray(selectedArticle.content) && selectedArticle.content.length > 0 ? (
                      selectedArticle.content.map((paragraph, index) => (
                        <p key={`${selectedArticle.id}-paragraph-${index}`}>{paragraph}</p>
                      ))
                    ) : (
                      <p>Artículo en actualización.</p>
                    )}

                    {selectedArticle.sourceUrl ? (
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                          Fuente:{" "}
                          <a
                            href={selectedArticle.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-pink-accent hover:underline"
                          >
                            {selectedArticle.sourceLabel || "Enlace externo"}
                          </a>
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


