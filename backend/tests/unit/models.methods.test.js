const User = require('../../models/User');
const Dish = require('../../models/Dish');
const News = require('../../models/News');
const Review = require('../../models/Review');

describe('model instance methods', () => {
  test('User toPublicProfile and calculateBMI', () => {
    const user = new User({
      email: 'x@y.com',
      password: 'Password1!',
      name: 'User',
      weight: 80,
      height: 180
    });
    const profile = user.toPublicProfile();
    expect(profile.password).toBeUndefined();
    expect(user.calculateBMI()).toBe('24.69');
  });

  test('User incrementTokenVersion calls save', async () => {
    const user = new User({ email: 'x2@y.com', password: 'Password1!', name: 'User2', tokenVersion: 0 });
    user.save = jest.fn().mockResolvedValue(user);
    await user.incrementTokenVersion();
    expect(user.tokenVersion).toBe(1);
    expect(user.save).toHaveBeenCalled();
  });

  test('Dish methods update counters and save', async () => {
    const dish = new Dish({
      name: 'Dish',
      description: 'desc',
      image: 'img',
      category: 'breakfast',
      nutrition: { calories: 1, protein: 1, carbs: 1, fats: 1 },
      prepTime: 1
    });
    dish.save = jest.fn().mockResolvedValue(dish);
    await dish.addFavorite();
    await dish.removeFavorite();
    await dish.incrementViews();
    expect(dish.save).toHaveBeenCalledTimes(3);
  });

  test('News methods update counters and save', async () => {
    const news = new News({
      title: 'T',
      summary: 'S',
      content: 'one two three',
      image: 'img',
      category: 'news',
      author: { name: 'Author' }
    });
    news.save = jest.fn().mockResolvedValue(news);
    await news.incrementViews();
    await news.addLike();
    await news.removeLike();
    await news.addSave();
    await news.removeSave();
    await news.incrementShares();
    expect(news.save).toHaveBeenCalledTimes(6);
    expect(Number(news.calculatedReadTime)).toBeGreaterThanOrEqual(1);
  });

  test('Review calculateAverageRating updates recipe aggregate', async () => {
    Review.aggregate = jest.fn().mockResolvedValue([{ _id: 'r1', nRating: 2, avgRating: 4.2 }]);
    const updateMock = jest.fn().mockResolvedValue({});
    const mongoose = require('mongoose');
    const modelSpy = jest.spyOn(mongoose, 'model').mockReturnValue({ findByIdAndUpdate: updateMock });

    await Review.calculateAverageRating('recipe1');
    expect(Review.aggregate).toHaveBeenCalled();
    expect(updateMock).toHaveBeenCalled();

    modelSpy.mockRestore();
  });
});
