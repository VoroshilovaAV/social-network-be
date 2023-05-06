const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');

// Настройка multer для загрузки изображений
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Загрузить изображение
router.post('/', auth, upload.single('image'), (req, res) => {
  try {
    const filename = req.file.filename;
    res.json({ filename });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Ошибка сервера');
  }
});

module.exports = router;
