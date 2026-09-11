import { userService } from './user.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export const getUserProfile = async (req, res, next) => {
  try {
    const profile = await userService.getUserProfile(req.params.username);
    sendSuccess(res, profile, 200);
  } catch (error) {
    next(error);
  }
};
