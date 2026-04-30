const isAdmin = (user) => user?.role === 'admin';

const isOwner = (resourceAuthorId, user) => {
  if (!resourceAuthorId || !user?._id) return false;
  return String(resourceAuthorId) === String(user._id);
};

const canEditRecipe = (recipe, user) => isOwner(recipe?.author, user);
const canDeleteRecipe = (recipe, user) => isOwner(recipe?.author, user) || isAdmin(user);
const canManageOwnAccount = (targetUserId, user) => String(targetUserId) === String(user?._id);
const canAdminManageUser = (targetUser, actor) => {
  if (!isAdmin(actor)) return false;
  if (!targetUser) return false;
  if (String(targetUser._id) === String(actor._id)) return false;
  if (targetUser.role === 'admin') return false;
  return true;
};

module.exports = {
  isAdmin,
  isOwner,
  canEditRecipe,
  canDeleteRecipe,
  canManageOwnAccount,
  canAdminManageUser
};
