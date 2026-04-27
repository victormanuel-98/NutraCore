import React, { useEffect, useMemo, useState } from 'react';
import { StarRating } from '../ui/StarRating';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';
import { getRecipeReviews, addOrUpdateReview } from '../../services/reviewService';
import { MessageSquare, Lock, Send, User } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export function ReviewSystem({ recipeId, averageRating, reviewsCount: initialCount }) {
  const { token, isAuthenticated, user } = useAuth();
  const { showNotification } = useNotification();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await getRecipeReviews(recipeId, token);
      if (response.success) {
        setReviews(response.data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [recipeId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (rating === 0) {
      setError('Por favor selecciona una valoración');
      return;
    }

    try {
      setSubmitting(true);
      const response = await addOrUpdateReview(recipeId, rating, comment, token);
      if (response.success) {
        showNotification('¡Gracias por tu valoración!', 'success');
        setComment('');
        setRating(0);
        setError('');
        fetchReviews();
      }
    } catch (err) {
      setError(err.message || 'Error al enviar la valoracion');
      showNotification(err.message || 'Error al enviar la valoración', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const userHasReviewed = reviews.find(r => r.user?._id === user?._id);
  const computedAverageRating = useMemo(() => {
    if (!Array.isArray(reviews) || reviews.length === 0) return averageRating || 0;
    const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    return Math.round((total / reviews.length) * 10) / 10;
  }, [reviews, averageRating]);
  const visibleReviewsCount = reviews.length;

  return (
    <div className="space-y-8">
      {/* Resumen de Valoraciones */}
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-pink-50/50 rounded-2xl border border-pink-100">
        <div className="text-center">
          <div className="text-5xl font-bold text-pink-accent font-logo mb-1">
            {computedAverageRating.toFixed(1)}
          </div>
          <StarRating rating={computedAverageRating} size={24} />
          <div className="text-sm text-pink-600/70 mt-2 font-medium">
            {visibleReviewsCount} valoraciones
          </div>
        </div>
        
        <div className="flex-1 space-y-2 w-full">
          {/* Aquí se podrían añadir barras de progreso por cada estrella si se quisiera más detalle */}
          <p className="text-gray-600 text-sm italic">
            "Tu feedback ayuda a la comunidad a descubrir las mejores recetas y a los autores a mejorar."
          </p>
        </div>
      </div>

      {/* Formulario de Valoración (Solo para registrados) */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h4 className="font-bold text-gray-900">
              {userHasReviewed ? 'Actualizar tu valoración' : 'Deja tu opinión'}
            </h4>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Tu nota:</span>
              <StarRating 
                rating={rating || (userHasReviewed?.rating || 0)} 
                readonly={false} 
                onRatingChange={setRating} 
                size={28} 
              />
            </div>

            <div className="relative">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escribe aquí tu comentario (opcional)..."
                className="w-full min-h-[100px] p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-accent focus:border-transparent transition-all resize-none text-gray-700"
                maxLength={1000}
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {comment.length}/1000
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button 
              type="submit" 
              disabled={submitting}
              className="bg-pink-accent hover:bg-pink-accent/90 text-white w-full sm:w-auto"
            >
              {submitting ? 'Enviando...' : (
                <div className="flex items-center gap-2">
                  <Send size={18} />
                  <span>Publicar Valoración</span>
                </div>
              )}
            </Button>
          </form>
        ) : (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="bg-gray-100 p-3 rounded-full mb-3">
              <Lock size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium mb-1">Inicia sesión para valorar</p>
            <p className="text-xs text-gray-400">Solo los usuarios registrados pueden dejar comentarios.</p>
          </div>
        )}
      </div>

      {/* Lista de Reviews */}
      <div className="space-y-4">
        <h4 className="font-bold text-gray-900 flex items-center gap-2">
          Comentarios recientes
          <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
            {reviews.length}
          </span>
        </h4>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-accent" />
          </div>
        ) : reviews.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {reviews.map((review, idx) => (
              <div key={review._id || idx} className="py-6 animate-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-accent font-bold">
                      <User size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{review.user?.name || 'Usuario'}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <StarRating rating={review.rating} size={16} />
                </div>
                
                {review.comment ? (
                  <p className="text-gray-700 leading-relaxed pl-13">
                    {review.comment}
                  </p>
                ) : (
                  <div className="pl-13 flex items-center gap-2 py-3 bg-gray-50 rounded-lg px-4 border border-dashed border-gray-200">
                    <Lock size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-500 italic">
                      Inicia sesión para ver los comentarios
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <MessageSquare size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">Aún no hay opiniones. ¡Sé el primero!</p>
          </div>
        )}
      </div>
    </div>
  );
}

