import React, { useEffect, useState } from 'react';
import { X, Clock, Flame, ChefHat, Info, MessageSquare, Star as StarIcon } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { StarRating } from '../ui/StarRating';
import { ReviewSystem } from './ReviewSystem';
import { useAuth } from '../../context/AuthContext';

const PixelX = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 8 8" fill="currentColor" className={className}>
    <path d="M0 0h1v1H0V0zm1 1h1v1H1V1zm1 1h1v1H2V2zm1 1h1v1H3V3zm1 1h1v1H4V4zm1 1h1v1H5V5zm1 1h1v1H6V6zm1 1h1v1H7V7zM0 7h1v1H0V7zm1-1h1v1H1V6zm1-1h1v1H2V5zm1-1h1v1H3V4zm2-2h1v1H5V2zm1-1h1v1H6V1zm1-1h1v1H7V0z" />
  </svg>
);

export function RecipeDetail({ recipe, onClose }) {
  const { isAuthenticated } = useAuth();
  
  if (!recipe) return null;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/40 modal-overlay-enter"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] modal-content-enter relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con Imagen */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden">
          {recipe.image ? (
            <img 
              src={recipe.image.replace('/upload/', '/upload/f_auto,q_auto,w_1200/')} 
              alt={recipe.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <ChefHat size={64} className="text-gray-300" />
            </div>
          )}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 group z-20"
          >
            <PixelX size={18} className="text-pink-accent group-hover:text-pink-accent/80 transition-colors" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 sm:p-8">
            <Badge className="mb-3 bg-pink-accent text-white border-none">
              {recipe.category}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-logo leading-tight">
              {recipe.title}
            </h2>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Métricas Rápidas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricCard icon={<Clock className="text-pink-accent" />} label="Tiempo" value={`${recipe.prepTime} min`} />
            <MetricCard icon={<Flame className="text-orange-500" />} label="Calorías" value={`${recipe.calories} kcal`} />
            <MetricCard icon={<ChefHat className="text-blue-500" />} label="Dificultad" value={recipe.difficulty} />
            <MetricCard 
              icon={<StarIcon className="text-pink-accent fill-pink-accent" />} 
              label="Valoración" 
              value={recipe.averageRating ? `${recipe.averageRating}/5` : 'S/V'} 
            />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Columna Izquierda: Ingredientes y Nutrición */}
            <div className="md:col-span-1 space-y-8">
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Info size={20} className="text-pink-accent" />
                  Nutrición
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <NutrientRow label="Proteína" value={`${recipe.protein}g`} />
                  <NutrientRow label="Carbohidratos" value={`${recipe.carbs}g`} />
                  <NutrientRow label="Grasas" value={`${recipe.fats}g`} />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">Ingredientes</h3>
                <ul className="space-y-2">
                  {recipe.ingredients?.map((ing, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-pink-accent shrink-0" />
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Columna Derecha: Pasos y Sistema de Reviews */}
            <div className="md:col-span-2 space-y-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Preparación</h3>
                <div className="space-y-6">
                  {recipe.steps?.map((step, idx) => (
                    <div key={idx} className="flex gap-4">
                      <span className="flex-none w-8 h-8 rounded-full bg-pink-50 text-pink-accent font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <p className="text-gray-700 leading-relaxed pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Sistema de Valoración y Comentarios */}
              <div id="reviews-section">
                <div className="flex items-center gap-2 mb-6">
                  <MessageSquare size={24} className="text-pink-accent" />
                  <h3 className="text-2xl font-bold font-logo">Opiniones de la Comunidad</h3>
                </div>
                
                <ReviewSystem recipeId={recipe.id} averageRating={recipe.averageRating} reviewsCount={recipe.reviewsCount} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value }) {
  return (
    <div className="bg-gray-50 p-3 rounded-xl flex flex-col items-center text-center hover:bg-gray-100 transition-colors">
      <div className="mb-1">{icon}</div>
      <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  );
}

function NutrientRow({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600">{label}</span>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  );
}
