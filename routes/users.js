const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post');

// Получить список всех пользователей
router.get('/', auth, async (req, res) => {
try {
const users = await User.find().select('-password');
res.json(users);
} catch (err) {
console.error(err.message);
res.status(500).send('Ошибка сервера');
}
});

// Получить информацию о пользователе
router.get('/:id', auth, async (req, res) => {
try {
const user = await User.findById(req.params.id)
.populate({ path: 'posts', populate: { path: 'user', select: '-password' } })
.select('-password');
if (!user) return res.status(404).json({ msg: 'Пользователь не найден' });

res.json(user);
} catch (err) {
console.error(err.message);
if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Пользователь не найден' });
res.status(500).send('Ошибка сервера');
}
});

// Добавить пост на страницу пользователя
router.post('/:id/posts', auth, async (req, res) => {
try {
const user = await User.findById(req.params.id);
if (!user) return res.status(404).json({ msg: 'Пользователь не найден' });

const { text } = req.body;
const post = new Post({ user: req.user.id, text });

if (req.files && req.files.image) {
  const { image } = req.files;
  const filename = `${Date.now()}-${image.name}`;
  await image.mv(`./uploads/${filename}`);
  post.image = filename;
}

await post.save();
user.posts.unshift(post._id);
await user.save();

res.json(post);
} catch (err) {
console.error(err.message);
if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Пользователь не найден' });
res.status(500).send('Ошибка сервера');
}
});

// Получить список друзей
router.get('/:id/friends', auth, async (req, res) => {
try {
const user = await User.findById(req.params.id)
.populate({ path: 'friends', select: '-password' })
.select('-password');
if (!user) return res.status(404).json({ msg: 'Пользователь не найден' });

res.json(user.friends);
} catch (err) {
console.error(err.message);
if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Пользователь не найден' });
res.status(500).send('Ошибка сервера');
}
});

// Добавить друга
router.post('/:id/friends/:friendId', auth, async (req, res) => {
try {
const user = await User.findById(req.params.id);
if (!user) return res.status(404).json({ msg: 'Пользователь не найден' });

const friend = await User.findById(req.params.friendId);
if (!friend) return res.status(404).json({ msg: 'Пользователь не найден' });

if (user.friends.includes(friend._id)) return res.status(400).json({ msg: 'Пользователь уже добавлен в друзья' });

user.friends.push(friend._id);
await user.save();

res.json({ msg: 'Пользователь добавлен в друзья' });
} catch (err) {
console.error(err.message);
if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Пользователь не найден' });
res.status(500).send('Ошибка сервера');
}
});

// Удалить друга
router.delete('/:id/friends/:friendId', auth, async (req, res) => {
try {
const user = await User.findById(req.params.id);
if (!user) return res.status(404).json({ msg: 'Пользователь не найден' });

const friend = await User.findById(req.params.friendId);
if (!friend) return res.status(404).json({ msg: 'Пользователь не найден' });

if (!user.friends.includes(friend._id)) return res.status(400).json({ msg: 'Пользователь не добавлен в друзья' });

user.friends = user.friends.filter(id => id.toString() !== friend._id.toString());
await user.save();

res.json({ msg: 'Пользователь удален из друзей' });
} catch (err) {
console.error(err.message);
if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Пользователь не найден' });
res.status(500).send('Ошибка сервера');
}
});

module.exports = router;