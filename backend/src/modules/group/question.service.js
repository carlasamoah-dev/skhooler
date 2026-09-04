/**
 * Question service
 */
import { prisma } from '../../config/database.js'
import { logger } from '../../utils/logger.js'

class QuestionService {
  /**
   * Sets questions (replaces existing)
   * @param {string} groupId 
   * @param {Object} data 
   * @param {Array} data.questions
   * @returns {Promise<Array>}
   */
  async setQuestions(groupId, { questions }) {
    return prisma.$transaction(async (tx) => {
      await tx.groupQuestion.deleteMany({
        where: { groupId }
      })

      if (!questions || questions.length === 0) {
        return []
      }

      const createData = questions.map((q, index) => ({
        groupId,
        question: q.question,
        isRequired: q.isRequired ?? false,
        position: index + 1
      }))

      await tx.groupQuestion.createMany({
        data: createData
      })

      return tx.groupQuestion.findMany({
        where: { groupId },
        orderBy: { position: 'asc' }
      })
    })
  }

  /**
   * Gets questions
   * @param {string} groupId 
   * @returns {Promise<Array>}
   */
  async getQuestions(groupId) {
    return prisma.groupQuestion.findMany({
      where: { groupId },
      orderBy: { position: 'asc' }
    })
  }
}

export const questionService = new QuestionService()
