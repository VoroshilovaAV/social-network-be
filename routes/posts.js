const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');

// Получить ленту постов от друзей
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const friends = user.friends;
    const posts = await Post.find({ user: { $in: friends } })
      .populate('user', '-password')
      .sort({ createdAt: -1 })
      .exec();
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Ошибка сервера');
  }
});

module.exports = router;