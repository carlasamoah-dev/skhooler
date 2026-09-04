import { prisma } from '../../config/database.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../utils/errors.js';

/**
 * Generate a unique slug for a given string
 * @param {string} title
 * @param {function} checkExists - async function returning boolean if slug exists
 * @returns {Promise<string>}
 */
async function generateUniqueSlug(title, checkExists) {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  let slug = baseSlug;
  let counter = 1;
  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

class CourseService {
  /**
   * Create a new course
   * @param {string} groupId 
   * @param {object} data 
   * @returns {Promise<object>}
   */
  async createCourse(groupId, data) {
    const slug = await generateUniqueSlug(data.title, async (s) => {
      const existing = await prisma.course.findFirst({ where: { groupId, slug: s, deletedAt: null } });
      return !!existing;
    });

    if (data.accessType === 'TIER_LOCKED' && data.requiredTierId) {
      const tier = await prisma.memberTier.findFirst({
        where: { id: data.requiredTierId, groupId }
      });
      if (!tier) throw new BadRequestError('Tier does not belong to group');
    }

    const maxPosition = await prisma.course.aggregate({
      where: { groupId, deletedAt: null },
      _max: { position: true }
    });
    const position = (maxPosition._max.position || 0) + 1;

    return prisma.course.create({
      data: {
        ...data,
        groupId,
        slug,
        position
      }
    });
  }

  /**
   * Get list of courses for a group
   * @param {string} groupId 
   * @param {string} userId 
   * @param {string} userRole 
   * @returns {Promise<Array>}
   */
  async getCourses(groupId, userId, userRole) {
    const isAdmin = ['OWNER', 'ADMIN'].includes(userRole);
    
    const whereClause = { groupId, deletedAt: null };
    if (!isAdmin) {
      whereClause.isPublished = true;
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      orderBy: { position: 'asc' },
      include: {
        _count: { select: { modules: true } }
      }
    });

    let userTierId = null;
    if (!isAdmin) {
      const member = await prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId, userId } }
      });
      userTierId = member?.tierId;
    }

    const result = [];
    for (const course of courses) {
      let hasAccess = false;
      
      if (isAdmin) {
        hasAccess = true;
      } else if (course.accessType === 'OPEN') {
        hasAccess = true;
      } else if (course.accessType === 'TIER_LOCKED') {
        hasAccess = course.requiredTierId === userTierId;
      } else if (course.accessType === 'PRIVATE_GRANT') {
        const access = await prisma.courseMemberAccess.findFirst({
          where: { courseId: course.id, userId }
        });
        hasAccess = !!access;
      }

      let progressPercentage = 0;
      if (hasAccess) {
        const totalLessons = await prisma.lesson.count({
          where: {
            module: { courseId: course.id, isPublished: true, deletedAt: null },
            isPublished: true,
            deletedAt: null
          }
        });
        
        if (totalLessons > 0) {
          const completedLessons = await prisma.lessonProgress.count({
            where: {
              userId,
              isCompleted: true,
              lesson: {
                module: { courseId: course.id, isPublished: true, deletedAt: null },
                isPublished: true,
                deletedAt: null
              }
            }
          });
          progressPercentage = Math.round((completedLessons / totalLessons) * 100);
        }
      }

      result.push({
        ...course,
        hasAccess,
        progressPercentage
      });
    }

    return result;
  }

  /**
   * Get course by slug
   * @param {string} groupId 
   * @param {string} courseSlug 
   * @param {string} userId 
   * @param {string} userRole 
   * @returns {Promise<object>}
   */
  async getCourseBySlug(groupId, courseSlug, userId, userRole) {
    const course = await prisma.course.findFirst({
      where: { groupId, slug: courseSlug, deletedAt: null }
    });

    if (!course) {
      throw new NotFoundError('Course');
    }

    const isAdmin = ['OWNER', 'ADMIN'].includes(userRole);
    if (!course.isPublished && !isAdmin) {
      throw new NotFoundError('Course');
    }

    let hasAccess = false;
    let userTierId = null;
    if (isAdmin) {
      hasAccess = true;
    } else {
      const member = await prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId, userId } }
      });
      userTierId = member?.tierId;

      if (course.accessType === 'OPEN') {
        hasAccess = true;
      } else if (course.accessType === 'TIER_LOCKED') {
        hasAccess = course.requiredTierId === userTierId;
      } else if (course.accessType === 'PRIVATE_GRANT') {
        const access = await prisma.courseMemberAccess.findFirst({
          where: { courseId: course.id, userId }
        });
        hasAccess = !!access;
      }
    }

    if (!hasAccess) {
      return { ...course, hasAccess: false };
    }

    const modulesQuery = {
      where: { courseId: course.id, deletedAt: null },
      orderBy: { position: 'asc' },
      include: {
        lessons: {
          where: { deletedAt: null },
          orderBy: { position: 'asc' },
          include: {
            progress: {
              where: { userId }
            }
          }
        }
      }
    };

    if (!isAdmin) {
      modulesQuery.where.isPublished = true;
      modulesQuery.include.lessons.where.isPublished = true;
    }

    const modules = await prisma.courseModule.findMany(modulesQuery);

    return { ...course, modules, hasAccess: true };
  }

  /**
   * Update a course
   * @param {string} groupId 
   * @param {string} courseId 
   * @param {object} data 
   * @returns {Promise<object>}
   */
  async updateCourse(groupId, courseId, data) {
    const course = await prisma.course.findFirst({
      where: { id: courseId, groupId, deletedAt: null }
    });
    if (!course) throw new NotFoundError('Course');

    let newSlug = course.slug;
    if (data.title && data.title !== course.title) {
      newSlug = await generateUniqueSlug(data.title, async (s) => {
        const existing = await prisma.course.findFirst({
          where: { groupId, slug: s, id: { not: courseId }, deletedAt: null }
        });
        return !!existing;
      });
    }

    if (data.requiredTierId && data.requiredTierId !== course.requiredTierId) {
      const tier = await prisma.memberTier.findFirst({
        where: { id: data.requiredTierId, groupId }
      });
      if (!tier) throw new BadRequestError('Tier does not belong to group');
    }

    return prisma.course.update({
      where: { id: courseId },
      data: {
        ...data,
        slug: newSlug
      }
    });
  }

  /**
   * Delete a course
   * @param {string} groupId 
   * @param {string} courseId 
   * @returns {Promise<void>}
   */
  async deleteCourse(groupId, courseId) {
    const course = await prisma.course.findFirst({
      where: { id: courseId, groupId, deletedAt: null }
    });
    if (!course) throw new NotFoundError('Course');

    await prisma.course.update({
      where: { id: courseId },
      data: { deletedAt: new Date() }
    });
  }

  /**
   * Reorder courses
   * @param {string} groupId 
   * @param {Array<string>} orderedIds 
   * @returns {Promise<void>}
   */
  async reorderCourses(groupId, orderedIds) {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.course.updateMany({
          where: { id, groupId },
          data: { position: index }
        })
      )
    );
  }

  /**
   * Create a module
   * @param {string} courseId 
   * @param {object} data 
   * @returns {Promise<object>}
   */
  async createModule(courseId, data) {
    const course = await prisma.course.findFirst({
      where: { id: courseId, deletedAt: null }
    });
    if (!course) throw new NotFoundError('Course');

    const maxPosition = await prisma.courseModule.aggregate({
      where: { courseId, deletedAt: null },
      _max: { position: true }
    });
    const position = (maxPosition._max.position || 0) + 1;

    return prisma.courseModule.create({
      data: {
        ...data,
        courseId,
        position
      }
    });
  }

  /**
   * Update a module
   * @param {string} moduleId 
   * @param {object} data 
   * @returns {Promise<object>}
   */
  async updateModule(moduleId, data) {
    const module = await prisma.courseModule.findFirst({
      where: { id: moduleId, deletedAt: null }
    });
    if (!module) throw new NotFoundError('CourseModule');

    return prisma.courseModule.update({
      where: { id: moduleId },
      data
    });
  }

  /**
   * Delete a module
   * @param {string} moduleId 
   * @returns {Promise<void>}
   */
  async deleteModule(moduleId) {
    const module = await prisma.courseModule.findFirst({
      where: { id: moduleId, deletedAt: null }
    });
    if (!module) throw new NotFoundError('CourseModule');

    await prisma.courseModule.update({
      where: { id: moduleId },
      data: { deletedAt: new Date() }
    });
  }

  /**
   * Reorder modules
   * @param {string} courseId 
   * @param {Array<string>} orderedIds 
   * @returns {Promise<void>}
   */
  async reorderModules(courseId, orderedIds) {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.courseModule.updateMany({
          where: { id, courseId },
          data: { position: index }
        })
      )
    );
  }

  /**
   * Create a lesson
   * @param {string} moduleId 
   * @param {object} data 
   * @returns {Promise<object>}
   */
  async createLesson(moduleId, data) {
    const module = await prisma.courseModule.findFirst({
      where: { id: moduleId, deletedAt: null }
    });
    if (!module) throw new NotFoundError('CourseModule');

    const slug = await generateUniqueSlug(data.title, async (s) => {
      const existing = await prisma.lesson.findFirst({
        where: { moduleId, slug: s, deletedAt: null }
      });
      return !!existing;
    });

    const maxPosition = await prisma.lesson.aggregate({
      where: { moduleId, deletedAt: null },
      _max: { position: true }
    });
    const position = (maxPosition._max.position || 0) + 1;

    return prisma.lesson.create({
      data: {
        ...data,
        moduleId,
        slug,
        position
      }
    });
  }

  /**
   * Get a lesson
   * @param {string} groupId 
   * @param {string} lessonId 
   * @param {string} userId 
   * @param {string} userRole 
   * @returns {Promise<object>}
   */
  async getLesson(groupId, lessonId, userId, userRole) {
    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, deletedAt: null },
      include: {
        module: {
          include: {
            course: true
          }
        },
        progress: {
          where: { userId }
        }
      }
    });

    if (!lesson || !lesson.module || !lesson.module.course || lesson.module.course.groupId !== groupId) {
      throw new NotFoundError('Lesson');
    }

    const course = lesson.module.course;
    const isAdmin = ['OWNER', 'ADMIN'].includes(userRole);

    let hasAccess = false;
    if (isAdmin) {
      hasAccess = true;
    } else {
      const member = await prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId, userId } }
      });
      const userTierId = member?.tierId;

      if (course.accessType === 'OPEN') {
        hasAccess = true;
      } else if (course.accessType === 'TIER_LOCKED') {
        hasAccess = course.requiredTierId === userTierId;
      } else if (course.accessType === 'PRIVATE_GRANT') {
        const access = await prisma.courseMemberAccess.findFirst({
          where: { courseId: course.id, userId }
        });
        hasAccess = !!access;
      }
    }

    if (!hasAccess && !lesson.isFreePreview) {
      throw new ForbiddenError('Course access required');
    }

    return lesson;
  }

  /**
   * Update a lesson
   * @param {string} lessonId 
   * @param {object} data 
   * @returns {Promise<object>}
   */
  async updateLesson(lessonId, data) {
    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, deletedAt: null }
    });
    if (!lesson) throw new NotFoundError('Lesson');

    let newSlug = lesson.slug;
    if (data.title && data.title !== lesson.title) {
      newSlug = await generateUniqueSlug(data.title, async (s) => {
        const existing = await prisma.lesson.findFirst({
          where: { moduleId: lesson.moduleId, slug: s, id: { not: lessonId }, deletedAt: null }
        });
        return !!existing;
      });
    }

    return prisma.lesson.update({
      where: { id: lessonId },
      data: {
        ...data,
        slug: newSlug
      }
    });
  }

  /**
   * Delete a lesson
   * @param {string} lessonId 
   * @returns {Promise<void>}
   */
  async deleteLesson(lessonId) {
    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, deletedAt: null }
    });
    if (!lesson) throw new NotFoundError('Lesson');

    await prisma.lesson.update({
      where: { id: lessonId },
      data: { deletedAt: new Date() }
    });
  }

  /**
   * Reorder lessons
   * @param {string} moduleId 
   * @param {Array<string>} orderedIds 
   * @returns {Promise<void>}
   */
  async reorderLessons(moduleId, orderedIds) {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.lesson.updateMany({
          where: { id, moduleId },
          data: { position: index }
        })
      )
    );
  }

  /**
   * Grant member access to a course
   * @param {string} courseId 
   * @param {string} memberUserId 
   * @param {string} grantedBy 
   * @returns {Promise<object>}
   */
  async grantMemberAccess(courseId, memberUserId, grantedBy) {
    return prisma.courseMemberAccess.upsert({
      where: {
        courseId_userId: { courseId, userId: memberUserId }
      },
      update: {},
      create: {
        courseId,
        userId: memberUserId,
        grantedById: grantedBy
      }
    });
  }

  /**
   * Revoke member access from a course
   * @param {string} courseId 
   * @param {string} memberUserId 
   * @returns {Promise<void>}
   */
  async revokeMemberAccess(courseId, memberUserId) {
    await prisma.courseMemberAccess.deleteMany({
      where: { courseId, userId: memberUserId }
    });
  }

  /**
   * Get course members with access
   * @param {string} courseId 
   * @param {object} options 
   * @returns {Promise<Array>}
   */
  async getCourseMembersAccess(courseId, { cursor, limit = 50 }) {
    const args = {
      where: { courseId },
      take: limit,
      include: {
        user: true,
        grantedBy: true
      },
      orderBy: { createdAt: 'desc' }
    };

    if (cursor) {
      args.cursor = { id: cursor };
      args.skip = 1;
    }

    return prisma.courseMemberAccess.findMany(args);
  }
}

export const courseService = new CourseService();
