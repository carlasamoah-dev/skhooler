import { prisma } from '../../config/database.js';
import { NotFoundError } from '../../utils/errors.js';

class UserService {
  async getUserProfile(username) {
    const user = await prisma.user.findUnique({
      where: { username, deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        avatarUrl: true,
        bio: true,
        location: true,
        socialLinks: true,
        createdAt: true,
        ownedGroups: {
          select: {
            slug: true,
            name: true,
            iconUrl: true
          }
        }
      }
    });

    if (!user) {
      throw new NotFoundError('User profile not found');
    }

    return {
      ...user,
      createdCommunities: user.ownedGroups
    };
  }
}

export const userService = new UserService();
