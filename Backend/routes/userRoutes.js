const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    updateUserProfile,
    updateUserPassword,
    adminUpdateUserPassword,
    getAllUsers,
    updateUser,
    deleteUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('Admin'), getAllUsers);
router.put('/:id', protect, authorize('Admin'), updateUser);
router.put('/:id/password', protect, authorize('Admin'), adminUpdateUserPassword);
router.delete('/:id', protect, authorize('Admin'), deleteUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/password', protect, updateUserPassword);

module.exports = router;
