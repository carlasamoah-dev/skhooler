import { Router } from 'express'
import * as groupController from './group.controller.js'
import * as categoryController from './category.controller.js'
import * as tierController from './tier.controller.js'
import * as questionController from './question.controller.js'
import * as linkController from './link.controller.js'
import * as joinController from './join.controller.js'
import * as inviteController from './invite.controller.js'
import { authenticate, optionalAuth } from '../../middleware/auth.js'
import { loadGroup, requireOwner, requireAdmin, requireModerator, requireMembership } from '../../middleware/authorize.js'
import { validateBody, validateQuery } from '../../middleware/validateRequest.js'
import * as schemas from './group.schema.js'

const router = Router()

// ──── Discovery (public, no auth) ────
router.get('/', validateQuery(schemas.discoverQuerySchema), groupController.discoverGroups)

// ──── Group CRUD ────
router.post('/', authenticate, validateBody(schemas.createGroupSchema), groupController.createGroup)
router.get('/:slug', authenticate, loadGroup, requireMembership(), groupController.getGroup)
router.get('/:slug/landing', optionalAuth, groupController.getGroupLanding)
router.patch('/:slug', authenticate, loadGroup, requireOwner, validateBody(schemas.updateGroupSchema), groupController.updateGroup)
router.patch('/:slug/pricing', authenticate, loadGroup, requireOwner, validateBody(schemas.updatePricingSchema), groupController.updateGroupPricing)
router.delete('/:slug', authenticate, loadGroup, requireOwner, groupController.deleteGroup)

// ──── Members ────
router.get('/:slug/members/geography', authenticate, loadGroup, requireMembership(), groupController.getGeography)
router.get('/:slug/members', authenticate, loadGroup, requireMembership(), validateQuery(schemas.membersQuerySchema), groupController.getMembers)
router.patch('/:slug/members/:memberId/role', authenticate, loadGroup, requireAdmin, validateBody(schemas.updateMemberRoleSchema), groupController.updateMemberRole)
router.patch('/:slug/members/:memberId/tier', authenticate, loadGroup, requireAdmin, validateBody(schemas.updateMemberTierSchema), groupController.updateMemberTier)
router.delete('/:slug/members/:memberId', authenticate, loadGroup, requireModerator, groupController.removeMember)

// ──── Join Flow ────
router.post('/:slug/join', authenticate, loadGroup, validateBody(schemas.joinGroupSchema), joinController.joinGroup)
router.post('/:slug/leave', authenticate, loadGroup, requireMembership(), joinController.leaveGroup)
router.get('/:slug/members/:memberId/profile', authenticate, loadGroup, requireMembership(), joinController.getMemberProfile)

// ──── Join Requests (admin/owner) ────
router.get('/:slug/requests', authenticate, loadGroup, requireModerator, validateQuery(schemas.joinRequestQuerySchema), joinController.getJoinRequests)
router.post('/:slug/requests/:requestId/approve', authenticate, loadGroup, requireModerator, joinController.approveRequest)
router.post('/:slug/requests/:requestId/decline', authenticate, loadGroup, requireModerator, joinController.declineRequest)

// ──── Invites ────
router.post('/:slug/invites', authenticate, loadGroup, requireAdmin, validateBody(schemas.createInviteSchema), inviteController.createInvite)
router.get('/:slug/invites', authenticate, loadGroup, requireAdmin, inviteController.getInvites)
router.get('/:slug/share-link', authenticate, loadGroup, requireAdmin, inviteController.getShareLink)
router.delete('/:slug/invites/:inviteId', authenticate, loadGroup, requireAdmin, inviteController.revokeInvite)
router.post('/:slug/invites/email', authenticate, loadGroup, requireAdmin, validateBody(schemas.inviteByEmailSchema), inviteController.inviteByEmail)

// ──── Join via invite code (no group context needed) ────
router.get('/invite/:code/validate', inviteController.validateInvite)
router.post('/join/:code', authenticate, inviteController.joinViaInvite)

// ──── Categories ────
router.post('/:slug/categories', authenticate, loadGroup, requireOwner, validateBody(schemas.createCategorySchema), categoryController.createCategory)
router.get('/:slug/categories', authenticate, loadGroup, requireMembership(), categoryController.getCategories)
router.patch('/:slug/categories/:categoryId', authenticate, loadGroup, requireOwner, validateBody(schemas.updateCategorySchema), categoryController.updateCategory)
router.delete('/:slug/categories/:categoryId', authenticate, loadGroup, requireOwner, categoryController.deleteCategory)
router.patch('/:slug/categories/reorder', authenticate, loadGroup, requireOwner, validateBody(schemas.reorderCategoriesSchema), categoryController.reorderCategories)

// ──── Tiers ────
router.post('/:slug/tiers', authenticate, loadGroup, requireOwner, validateBody(schemas.createTierSchema), tierController.createTier)
router.get('/:slug/tiers', authenticate, loadGroup, requireMembership(), tierController.getTiers)
router.patch('/:slug/tiers/:tierId', authenticate, loadGroup, requireOwner, validateBody(schemas.updateTierSchema), tierController.updateTier)
router.delete('/:slug/tiers/:tierId', authenticate, loadGroup, requireOwner, tierController.deleteTier)

// ──── Membership Questions ────
router.put('/:slug/questions', authenticate, loadGroup, requireOwner, validateBody(schemas.setQuestionsSchema), questionController.setQuestions)
router.get('/:slug/questions', authenticate, loadGroup, requireOwner, questionController.getQuestions)

// ──── External Links ────
router.post('/:slug/links', authenticate, loadGroup, requireOwner, validateBody(schemas.createLinkSchema), linkController.createLink)
router.get('/:slug/links', authenticate, loadGroup, requireMembership(), linkController.getLinks)
router.patch('/:slug/links/:linkId', authenticate, loadGroup, requireOwner, validateBody(schemas.updateLinkSchema), linkController.updateLink)
router.delete('/:slug/links/:linkId', authenticate, loadGroup, requireOwner, linkController.deleteLink)

export default router
