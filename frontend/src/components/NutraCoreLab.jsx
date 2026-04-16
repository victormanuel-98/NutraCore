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

// Mock database de ingredientes
const ingredientDatabase = {
  "pechuga de pollo": { name: "Pechuga de pollo", unit: "g", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  "arroz blanco": { name: "Arroz blanco", unit: "g", calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  "brócoli": { name: "Brócoli", unit: "g", calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  "salmón": { name: "Salmón", unit: "g", calories: 208, protein: 20, carbs: 0, fat: 13 },
  "aguacate": { name: "Aguacate", unit: "g", calories: 160, protein: 2, carbs: 8.5, fat: 15 },
  "huevo": { name: "Huevo", unit: "unidad", calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  "avena": { name: "Avena", unit: "g", calories: 389, protein: 17, carbs: 66, fat: 7 },
  "plátano": { name: "Plátano", unit: "unidad", calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  "espinaca": { name: "Espinaca", unit: "g", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  "quinoa": { name: "Quinoa", unit: "g", calories: 120, protein: 4.4, carbs: 21, fat: 1.9 },
};

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
      fat: Math.round(baseIngredient.fat * multiplier * 10) / 10,
    };

    setIngredients([...ingredients, newIngredient]);
    setSelectedIngredient("");
    setQuantity("");
    setSearchTerm("");
  };

  const removeIngredient = (id) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const calculateTotals = () => {
    return ingredients.reduce(
      (acc, ing) => ({
        calories: acc.calories + ing.calories,
        protein: acc.protein + ing.protein,
        carbs: acc.carbs + ing.carbs,
        fat: acc.fat + ing.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const totals = calculateTotals();
  const perServing = {
    calories: Math.round(totals.calories / servings),
    protein: Math.round((totals.protein / servings) * 10) / 10,
    carbs: Math.round((totals.carbs / servings) * 10) / 10,
    fat: Math.round((totals.fat / servings) * 10) / 10,
  };

  const filteredIngredients = Object.keys(ingredientDatabase).filter(key =>
    key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const saveRecipe = () => {
    // TODO: Implementar guardado de receta
    console.log("Saving recipe:", { recipeName, servings, ingredients });
    alert("Receta guardada exitosamente!");
  };

  return (
    <div className="min-h-screen bg-white">`r`n      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-pink-accent/10 p-3 rounded-lg">
                <Beaker className="w-8 h-8 text-pink-accent" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">
                NutraCore Lab
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Crea tus propias recetas y calcula automáticamente sus valores nutricionales
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Recipe Builder */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recipe Info */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Información de la Receta
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
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
                    <Label htmlFor="servings">Nmero de porciones</Label>
                    <Input
                      id="servings"
                      type="number"
                      min="1"
                      value={servings}
                      onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>
              </Card>

              {/* Add Ingredients */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Agregar Ingredientes
                </h2>
                
                <div className="space-y-4">
                  {/* Ingredient Search */}
                  <div className="space-y-2">
                    <Label htmlFor="search">Buscar ingrediente</Label>
                    <Input
                      id="search"
                      type="text"
                      placeholder="Buscar en la base de datos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    
                    {/* Ingredient suggestions */}
                    {searchTerm && (
                      <div className="border rounded-lg p-2 max-h-48 overflow-y-auto bg-white">
                        {filteredIngredients.length > 0 ? (
                          <div className="space-y-1">
                            {filteredIngredients.map(key => (
                              <button
                                key={key}
                                onClick={() => {
                                  setSelectedIngredient(key);
                                  setSearchTerm(ingredientDatabase[key].name);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded transition-colors"
                              >
                                <p className="font-medium text-gray-900">
                                  {ingredientDatabase[key].name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {ingredientDatabase[key].calories} kcal por 100{ingredientDatabase[key].unit}
                                </p>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm py-2 px-3">
                            No se encontraron ingredientes
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quantity Input */}
                  <div className="flex gap-2">
                    <div className="flex-1">
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
                    <div className="w-24">
                      <Label>Unidad</Label>
                      <div className="h-10 flex items-center justify-center bg-gray-100 rounded-lg border">
                        <span className="text-gray-600 text-sm">
                            {selectedIngredient ? ingredientDatabase[selectedIngredient].unit : "-"}
                        </span>
                      </div>
                    </div>
                    <div className="pt-6">
                      <Button
                        onClick={addIngredient}
                        disabled={!selectedIngredient || !quantity}
                        className="bg-pink-accent hover:bg-pink-accent/90 text-white h-10"
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Ingredients List */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Ingredientes ({ingredients.length})
                </h2>
                
                {ingredients.length > 0 ? (
                  <div className="space-y-3">
                    {ingredients.map((ing) => (
                      <div 
                        key={ing.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {ing.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {ing.quantity} {ing.unit} • {ing.calories} kcal
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right text-sm">
                            <p className="text-gray-600">
                              P: {ing.protein}g • C: {ing.carbs}g • G: {ing.fat}g
                            </p>
                          </div>
                          <button
                            onClick={() => removeIngredient(ing.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Calculator className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>Aún no has agregado ingredientes</p>
                    <p className="text-sm">Comienza buscando ingredientes arriba</p>
                  </div>
                )}
              </Card>
            </div>

            {/* Right Column - Nutritional Summary */}
            <div className="space-y-6">
              {/* Total Nutrition */}
              <Card className="p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Resumen Nutricional
                </h2>

                {/* Total */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Total de la receta</span>
                    <Badge variant="secondary">
                      {ingredients.length} ingredientes
                    </Badge>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-lg">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-pink-accent mb-1">
                        {totals.calories}
                      </p>
                      <p className="text-sm text-gray-700">calorías totales</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-pink-200">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">
                          {totals.protein.toFixed(1)}g
                        </p>
                        <p className="text-xs text-gray-600">Proteína</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">
                          {totals.carbs.toFixed(1)}g
                        </p>
                        <p className="text-xs text-gray-600">Carbos</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">
                          {totals.fat.toFixed(1)}g
                        </p>
                        <p className="text-xs text-gray-600">Grasas</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Per Serving */}
                {servings > 1 && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">
                      Por porción (total: {servings})
                    </p>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-gray-900 mb-1">
                          {perServing.calories}
                        </p>
                        <p className="text-sm text-gray-600">kcal/porción</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                        <div className="text-center">
                          <p className="font-bold text-gray-900">
                            {perServing.protein}g
                          </p>
                          <p className="text-xs text-gray-600">Proteína</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-gray-900">
                            {perServing.carbs}g
                          </p>
                          <p className="text-xs text-gray-600">Carbos</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-gray-900">
                            {perServing.fat}g
                          </p>
                          <p className="text-xs text-gray-600">Grasas</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Macro Distribution */}
                {ingredients.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-3">
                      Distribución de macros
                    </p>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Proteína</span>
                          <span className="font-medium">
                            {Math.round((totals.protein * 4 / totals.calories) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${Math.round((totals.protein * 4 / totals.calories) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Carbohidratos</span>
                          <span className="font-medium">
                            {Math.round((totals.carbs * 4 / totals.calories) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${Math.round((totals.carbs * 4 / totals.calories) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Grasas</span>
                          <span className="font-medium">
                            {Math.round((totals.fat * 9 / totals.calories) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{ width: `${Math.round((totals.fat * 9 / totals.calories) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  <Button 
                    onClick={saveRecipe}
                    disabled={!recipeName || ingredients.length === 0}
                    className="w-full bg-pink-accent hover:bg-pink-accent/90 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Receta
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="w-full">
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartir
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Exportar
                    </Button>
                  </div>
                </div>

                {/* Info */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex gap-2">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-900">
                      Los valores nutricionales son aproximados. Los cálculos se basan en 
                      datos estándar de alimentos.
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






