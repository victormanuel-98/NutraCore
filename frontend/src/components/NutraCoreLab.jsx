import { useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import {
  Plus,
  Trash2,
  Beaker,
  Calculator,
  Save,
  Share2,
  Download,
  Info
} from "lucide-react";

const ingredientDatabase = {
  "pechuga de pollo": { name: "Pechuga de pollo", unit: "g", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  "arroz blanco": { name: "Arroz blanco", unit: "g", calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  "brócoli": { name: "Brócoli", unit: "g", calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  "salmón": { name: "Salmón", unit: "g", calories: 208, protein: 20, carbs: 0, fat: 13 },
  aguacate: { name: "Aguacate", unit: "g", calories: 160, protein: 2, carbs: 8.5, fat: 15 },
  huevo: { name: "Huevo", unit: "unidad", calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  avena: { name: "Avena", unit: "g", calories: 389, protein: 17, carbs: 66, fat: 7 },
  "plátano": { name: "Plátano", unit: "unidad", calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  espinaca: { name: "Espinaca", unit: "g", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  quinoa: { name: "Quinoa", unit: "g", calories: 120, protein: 4.4, carbs: 21, fat: 1.9 }
};

function MacroBar({ label, color, value }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs sm:text-sm">
        <span>{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function NutraCoreLab() {
  const [recipeName, setRecipeName] = useState("");
  const [servings, setServings] = useState(1);
  const [ingredients, setIngredients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIngredient, setSelectedIngredient] = useState("");
  const [quantity, setQuantity] = useState("");

  const addIngredient = () => {
    if (!selectedIngredient || !quantity) return;

    const baseIngredient = ingredientDatabase[selectedIngredient];
    if (!baseIngredient) return;

    const qty = parseFloat(quantity);
    const multiplier = baseIngredient.unit === "unidad" ? qty : qty / 100;

    const newIngredient = {
      id: Date.now().toString(),
      name: baseIngredient.name,
      quantity: qty,
      unit: baseIngredient.unit,
      calories: Math.round(baseIngredient.calories * multiplier),
      protein: Math.round(baseIngredient.protein * multiplier * 10) / 10,
      carbs: Math.round(baseIngredient.carbs * multiplier * 10) / 10,
      fat: Math.round(baseIngredient.fat * multiplier * 10) / 10
    };

    setIngredients([...ingredients, newIngredient]);
    setSelectedIngredient("");
    setQuantity("");
    setSearchTerm("");
  };

  const removeIngredient = (id) => {
    setIngredients(ingredients.filter((ing) => ing.id !== id));
  };

  const calculateTotals = () =>
    ingredients.reduce(
      (acc, ing) => ({
        calories: acc.calories + ing.calories,
        protein: acc.protein + ing.protein,
        carbs: acc.carbs + ing.carbs,
        fat: acc.fat + ing.fat
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

  const totals = calculateTotals();
  const perServing = {
    calories: Math.round(totals.calories / servings),
    protein: Math.round((totals.protein / servings) * 10) / 10,
    carbs: Math.round((totals.carbs / servings) * 10) / 10,
    fat: Math.round((totals.fat / servings) * 10) / 10
  };

  const filteredIngredients = Object.keys(ingredientDatabase).filter((key) =>
    key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const macroPercent = (value, multiplier) => {
    if (!totals.calories) return 0;
    return Math.round((value * multiplier / totals.calories) * 100);
  };

  const saveRecipe = () => {
    console.log("Saving recipe:", { recipeName, servings, ingredients });
    alert("Receta guardada exitosamente!");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 pb-10 pt-20 sm:px-6 sm:pb-16 sm:pt-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center sm:mb-12">
            <div className="mb-3 flex items-center justify-center gap-2.5 sm:mb-4 sm:gap-3">
              <div className="rounded-lg bg-pink-accent/10 p-2.5 sm:p-3">
                <Beaker className="h-6 w-6 text-pink-accent sm:h-8 sm:w-8" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-4xl">NutraCore Lab</h1>
            </div>
            <p className="mx-auto max-w-xl text-sm text-gray-600 sm:max-w-2xl sm:text-lg">
              Crea tus propias recetas y calcula automáticamente sus valores nutricionales.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3 lg:gap-8">
            <div className="space-y-4 lg:col-span-2 lg:space-y-6">
              <Card className="p-4 sm:p-6">
                <h2 className="mb-3 text-lg font-bold text-gray-900 sm:mb-4 sm:text-xl">
                  Información de la receta
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipeName">Nombre de la receta</Label>
                    <Input
                      id="recipeName"
                      type="text"
                      placeholder="Ej: Bowl energético post-entreno"
                      value={recipeName}
                      onChange={(e) => setRecipeName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="servings">Número de porciones</Label>
                    <Input
                      id="servings"
                      type="number"
                      min="1"
                      value={servings}
                      onChange={(e) => setServings(parseInt(e.target.value, 10) || 1)}
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-4 sm:p-6">
                <h2 className="mb-3 text-lg font-bold text-gray-900 sm:mb-4 sm:text-xl">
                  Agregar ingredientes
                </h2>

                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Buscar ingrediente</Label>
                    <Input
                      id="search"
                      type="text"
                      placeholder="Buscar en la base de datos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    {searchTerm && (
                      <div className="max-h-40 overflow-y-auto rounded-lg border bg-white p-2 sm:max-h-48">
                        {filteredIngredients.length > 0 ? (
                          <div className="space-y-1">
                            {filteredIngredients.map((key) => (
                              <button
                                key={key}
                                onClick={() => {
                                  setSelectedIngredient(key);
                                  setSearchTerm(ingredientDatabase[key].name);
                                }}
                                className="w-full rounded px-3 py-2 text-left transition-colors hover:bg-gray-100"
                              >
                                <p className="font-medium text-gray-900">{ingredientDatabase[key].name}</p>
                                <p className="text-xs text-gray-500 sm:text-sm">
                                  {ingredientDatabase[key].calories} kcal por 100{ingredientDatabase[key].unit}
                                </p>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="px-3 py-2 text-sm text-gray-500">No se encontraron ingredientes</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_6rem_auto] sm:items-end">
                    <div className="min-w-0">
                      <Label htmlFor="quantity">Cantidad</Label>
                      <Input
                        id="quantity"
                        type="number"
                        placeholder="100"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        disabled={!selectedIngredient}
                      />
                    </div>
                    <div>
                      <Label>Unidad</Label>
                      <div className="flex h-10 items-center justify-center rounded-lg border bg-gray-100">
                        <span className="text-sm text-gray-600">
                          {selectedIngredient ? ingredientDatabase[selectedIngredient].unit : "-"}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={addIngredient}
                      disabled={!selectedIngredient || !quantity}
                      className="h-10 w-full bg-pink-accent text-white hover:bg-pink-accent/90 sm:w-10 sm:px-0"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-4 sm:p-6">
                <h2 className="mb-3 text-lg font-bold text-gray-900 sm:mb-4 sm:text-xl">
                  Ingredientes ({ingredients.length})
                </h2>

                {ingredients.length > 0 ? (
                  <div className="space-y-2.5 sm:space-y-3">
                    {ingredients.map((ing) => (
                      <div
                        key={ing.id}
                        className="flex items-start justify-between gap-3 rounded-lg bg-gray-50 p-3 sm:items-center sm:p-4"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 sm:text-base">{ing.name}</p>
                          <p className="text-xs text-gray-600 sm:text-sm">
                            {ing.quantity} {ing.unit} • {ing.calories} kcal
                          </p>
                        </div>
                        <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                          <div className="text-right text-xs sm:text-sm">
                            <p className="text-gray-600">
                              P: {ing.protein}g • C: {ing.carbs}g • G: {ing.fat}g
                            </p>
                          </div>
                          <button
                            onClick={() => removeIngredient(ing.id)}
                            className="text-red-500 transition-colors hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500 sm:py-12">
                    <Calculator className="mx-auto mb-3 h-10 w-10 text-gray-400 sm:h-12 sm:w-12" />
                    <p className="text-sm sm:text-base">Aún no has agregado ingredientes</p>
                    <p className="text-xs sm:text-sm">Comienza buscando ingredientes arriba</p>
                  </div>
                )}
              </Card>
            </div>

            <div className="space-y-4 lg:space-y-6">
              <Card className="sticky top-24 p-4 sm:p-6">
                <h2 className="mb-4 text-lg font-bold text-gray-900 sm:mb-6 sm:text-xl">
                  Resumen nutricional
                </h2>

                <div className="mb-4 sm:mb-6">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-600 sm:text-sm">Total de la receta</span>
                    <Badge variant="secondary" className="text-[10px] sm:text-xs">
                      {ingredients.length} ingredientes
                    </Badge>
                  </div>
                  <div className="rounded-lg bg-gradient-to-br from-pink-50 to-pink-100 p-4 sm:p-6">
                    <div className="text-center">
                      <p className="mb-1 text-3xl font-bold text-pink-accent sm:text-4xl">{totals.calories}</p>
                      <p className="text-xs text-gray-700 sm:text-sm">calorías totales</p>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 border-t border-pink-200 pt-4 sm:gap-4">
                      <div className="text-center">
                        <p className="text-sm font-bold text-gray-900 sm:text-lg">{totals.protein.toFixed(1)}g</p>
                        <p className="text-xs text-gray-600">Proteína</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-gray-900 sm:text-lg">{totals.carbs.toFixed(1)}g</p>
                        <p className="text-xs text-gray-600">Carbos</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-gray-900 sm:text-lg">{totals.fat.toFixed(1)}g</p>
                        <p className="text-xs text-gray-600">Grasas</p>
                      </div>
                    </div>
                  </div>
                </div>

                {servings > 1 && (
                  <div className="mb-4 sm:mb-6">
                    <p className="mb-2 text-xs text-gray-600 sm:text-sm">Por porción (total: {servings})</p>
                    <div className="rounded-lg bg-gray-50 p-4 sm:p-6">
                      <div className="text-center">
                        <p className="mb-1 text-2xl font-bold text-gray-900 sm:text-3xl">{perServing.calories}</p>
                        <p className="text-xs text-gray-600 sm:text-sm">kcal/porción</p>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-200 pt-4 sm:gap-4">
                        <div className="text-center">
                          <p className="text-sm font-bold text-gray-900">{perServing.protein}g</p>
                          <p className="text-xs text-gray-600">Proteína</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-gray-900">{perServing.carbs}g</p>
                          <p className="text-xs text-gray-600">Carbos</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-gray-900">{perServing.fat}g</p>
                          <p className="text-xs text-gray-600">Grasas</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {ingredients.length > 0 && (
                  <div className="mb-4 sm:mb-6">
                    <p className="mb-3 text-xs text-gray-600 sm:text-sm">Distribución de macros</p>
                    <div className="space-y-2.5 sm:space-y-3">
                      <MacroBar label="Proteína" color="bg-blue-500" value={macroPercent(totals.protein, 4)} />
                      <MacroBar label="Carbohidratos" color="bg-green-500" value={macroPercent(totals.carbs, 4)} />
                      <MacroBar label="Grasas" color="bg-yellow-500" value={macroPercent(totals.fat, 9)} />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Button
                    onClick={saveRecipe}
                    disabled={!recipeName || ingredients.length === 0}
                    className="h-10 w-full bg-pink-accent text-sm text-white hover:bg-pink-accent/90 sm:h-11"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Guardar receta
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="h-10 w-full text-xs sm:text-sm">
                      <Share2 className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
                      Compartir
                    </Button>
                    <Button variant="outline" className="h-10 w-full text-xs sm:text-sm">
                      <Download className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
                      Exportar
                    </Button>
                  </div>
                </div>

                <div className="mt-4 rounded-lg bg-blue-50 p-3 sm:mt-6 sm:p-4">
                  <div className="flex gap-2">
                    <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 sm:h-5 sm:w-5" />
                    <p className="text-xs text-blue-900 sm:text-sm">
                      Los valores nutricionales son aproximados. Los cálculos se basan en datos estándar de alimentos.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
