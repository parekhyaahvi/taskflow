const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, (req, res) => res.json({ success: true, data: req.user }));
router.put('/update', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (req.body.fullName) user.fullName = req.body.fullName;
        if (req.body.username) user.username = req.body.username;
        if (req.body.password) user.password = req.body.password;
        
        await user.save();
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

module.exports = router;
