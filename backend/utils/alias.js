const User = require('../models/User');

const pad4 = (value) => String(value).padStart(4, '0');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildSequentialAlias = async ({ prefix, role }) => {
  const regex = new RegExp(`^${escapeRegex(prefix)}(\\d{4})$`);
  const users = await User.find({ role }, { name: 1 }).lean();

  let maxSuffix = -1;
  for (const user of users) {
    const match = regex.exec(String(user.name || ''));
    if (!match) continue;
    const parsed = Number(match[1]);
    if (Number.isInteger(parsed) && parsed > maxSuffix) {
      maxSuffix = parsed;
    }
  }

  return `${prefix}${pad4(maxSuffix + 1)}`;
};

const buildNextUserAlias = async () =>
  buildSequentialAlias({ prefix: 'NutraUser', role: 'user' });

module.exports = {
  pad4,
  buildNextUserAlias
};

