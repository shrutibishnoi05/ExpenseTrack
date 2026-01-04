import multer from 'multer';
import path from 'path';
import { config } from '../config';
import { BadRequest } from '../utils';

/**
 * Configure multer for file uploads
 * Supports profile pictures and expense receipts
 */
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, config.uploadDir);
    },
    filename: (_req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});

/**
 * File filter for images only
 */
const imageFilter = (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(BadRequest('Only image files (JPEG, PNG, GIF, WebP) are allowed'));
    }
};

/**
 * Multer instance for profile picture uploads
 */
export const uploadProfilePicture = multer({
    storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: config.maxFileSize, // 5MB default
        files: 1,
    },
}).single('profilePicture');

/**
 * Multer instance for receipt uploads
 */
export const uploadReceipt = multer({
    storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: config.maxFileSize,
        files: 1,
    },
}).single('receipt');
