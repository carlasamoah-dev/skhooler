import { prisma } from '../../config/database.js';
import { NotFoundError } from '../../utils/errors.js';

class ProgressService {
  /**
   * Update progress for a specific lesson
   * @param {string} lessonId 
   * @param {string} userId 
   * @param {object} data - { isCompleted, lastPositionSeconds }
   * @returns {Promise<object>}
   */
  async updateLessonProgress(lessonId, userId, { isCompleted, lastPositionSeconds }) {
    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, deletedAt: null },
      include: {
        module: {
          include: { course: true }
        }
      }
    });

    if (!lesson || !lesson.module || lesson.module.deletedAt !== null) {
      throw new NotFoundError('Lesson');
    }

    const courseId = lesson.module.courseId;

    let completedAt = undefined;
    if (isCompleted === true) {
      completedAt = new Date();
    } else if (isCompleted === false) {
      completedAt = null;
    }

    const progress = await prisma.lessonProgress.upsert({
      where: {
        lessonId_userId: { lessonId, userId }
      },
      update: {
        ...(isCompleted !== undefined && { isCompleted, completedAt }),
        ...(lastPositionSeconds !== undefined && { lastPositionSeconds })
      },
      create: {
        lessonId,
        userId,
        isCompleted: isCompleted || false,
        completedAt: isCompleted ? new Date() : null,
        lastPositionSeconds: lastPositionSeconds || 0
      }
    });

    const courseProgress = await this.getCourseProgress(courseId, userId);

    return {
      progress,
      courseProgressPercentage: courseProgress.percentage
    };
  }

  /**
   * Get overall course progress for a user
   * @param {string} courseId 
   * @param {string} userId 
   * @returns {Promise<object>}
   */
  async getCourseProgress(courseId, userId) {
    const totalLessons = await prisma.lesson.count({
      where: {
        module: { courseId, isPublished: true, deletedAt: null },
        isPublished: true,
        deletedAt: null
      }
    });

    const completedLessons = await prisma.lessonProgress.count({
      where: {
        userId,
        isCompleted: true,
        lesson: {
          module: { courseId, isPublished: true, deletedAt: null },
          isPublished: true,
          deletedAt: null
        }
      }
    });

    const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      totalLessons,
      completedLessons,
      percentage
    };
  }
}

export const progressService = new ProgressService();
