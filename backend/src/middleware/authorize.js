/**
 * Role-based authorization middleware for group operations.
 */
import { prisma } from '../config/database.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

export const loadGroup = async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      throw new NotFoundError('Group');
    }

    const group = await prisma.group.findFirst({
      where: {
        slug,
        deletedAt: null
      }
    });

    if (!group) {
      throw new NotFoundError('Group');
    }

    req.group = group;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireMembership = (minRole = 'MEMBER') => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        throw new ForbiddenError('You must be authenticated');
      }

      if (!req.group || !req.group.id) {
        throw new NotFoundError('Group not loaded');
      }

      const membership = await prisma.groupMember.findFirst({
        where: {
          groupId: req.group.id,
          userId: req.user.id
        }
      });

      if (!membership) {
        throw new ForbiddenError('You are not a member of this group');
      }

      const roleHierarchy = { OWNER: 4, ADMIN: 3, MODERATOR: 2, MEMBER: 1 };
      
      const memberRoleRank = roleHierarchy[membership.role] || 0;
      const requiredRoleRank = roleHierarchy[minRole] || 1;

      if (memberRoleRank < requiredRoleRank) {
        throw new ForbiddenError('Insufficient permissions');
      }

      req.membership = membership;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireOwner = requireMembership('OWNER');
export const requireAdmin = requireMembership('ADMIN');
export const requireModerator = requireMembership('MODERATOR');
