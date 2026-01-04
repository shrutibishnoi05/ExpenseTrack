import { Router } from 'express';
import {
    getProfile,
    updateProfile,
    updateEmail,
    changePassword,
    uploadProfilePicture as uploadPictureHandler,
    deleteProfilePicture,
} from '../controllers/user.controller';
import { authenticate, validate, uploadProfilePicture } from '../middleware';
import { updateProfileSchema, changePasswordSchema } from '../utils';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: User profile }
 */
router.get('/profile', getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               currency: { type: string, enum: [INR, USD, EUR, GBP, JPY, AUD, CAD] }
 *               monthlyBudget: { type: number }
 *     responses:
 *       200: { description: Profile updated }
 */
router.put('/profile', validate(updateProfileSchema), updateProfile);

/**
 * @swagger
 * /api/users/profile/picture:
 *   post:
 *     summary: Upload profile picture
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture: { type: string, format: binary }
 *     responses:
 *       200: { description: Picture uploaded }
 */
router.post('/profile/picture', uploadProfilePicture, uploadPictureHandler);

/**
 * @swagger
 * /api/users/profile/picture:
 *   delete:
 *     summary: Delete profile picture
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Picture deleted }
 */
router.delete('/profile/picture', deleteProfilePicture);

/**
 * @swagger
 * /api/users/password:
 *   put:
 *     summary: Change password
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string, minLength: 8 }
 *     responses:
 *       200: { description: Password changed }
 */
router.put('/password', validate(changePasswordSchema), changePassword);

export default router;
