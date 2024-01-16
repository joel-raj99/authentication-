import express from 'express';
import {
  forgetPassword,
  login,
  register,
  resetPassword,
  verifyOtp,
} from '../controllers/auth.controller.js';

const router = express.Router(); // Add parentheses to call the function

// register route
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/forgetPassword').post(forgetPassword);
router.route('/verifyOTP').post(verifyOtp);
router.route('/resetPassword').post(resetPassword);

export { router };
