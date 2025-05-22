import prisma from '@/lib/prisma';
import { MasteryProcessor } from '../mastery/MasteryProcessor';
import { MetricType } from '@prisma/client';

export class MasteryService {
  private MasteryProcessor: MasteryProcessor;

  constructor(){
    this.MasteryProcessor = new MasteryProcessor();
  }
  async processUserBatch(batchSize: number, offset: number) {

    // TODO: Implement if user is active or not
    const users = await prisma.user.findMany({
      select: { id: true },
      skip: offset,
      take: batchSize,
    });

    const stats = {
      usersProcessed: users.length,
      subjects: 0,
      topics: 0,
      subtopics: 0,
    };

    for (const user of users) {
      const updateResult = await this.MasteryProcessor.updateUserMastery(user.id);

    await Promise.all(Object.keys(MetricType).map(async key => {
      const metricType = MetricType[key as keyof typeof MetricType];
      await this.UpdateMetrics(user.id, metricType);
    }));

      stats.subjects += updateResult.subjectsUpdated;
      stats.topics += updateResult.topicsUpdated;
      stats.subtopics += updateResult.subtopicsUpdated;
    }

    return stats;
  }

  private async UpdateMetrics(userId: string, metricType: MetricType) {
    const existingMetric = await prisma.metric.findFirst({
            where: {
                userId,
                metricType
            }
        });
        if (existingMetric) {
            await prisma.metric.update({
                where: {
                    id: existingMetric.id
                },
                data: {
                    previousValue: existingMetric.currentValue,
                }
            });
        }
        else{
            await prisma.metric.create({
                data: {
                    userId,
                    metricType,
                    previousValue: 0,
                    currentValue: 0
                }
            });
        }
    

    
  }

}


// STEP 3: Update subject masteries
      // if (subjectIds.size > 0) {
      //   const subjectsUpdated = await this.subjectRepo.updateMasteries(
      //     userId, 
      //     subjectIds, 
      //     subjectAttempts, 
      //     this.masteryCalculator
      //   );
      //   result.subjectsUpdated = subjectsUpdated;
      // }

      // STEP 4: Update topic masteries
      // if (topicIds.size > 0) {
      //   const topicsUpdated = await this.topicRepo.updateMasteries(
      //     userId, 
      //     topicIds, 
      //     topicAttempts, 
      //     this.masteryCalculator
      //   );
      //   result.topicsUpdated = topicsUpdated;
      // }

      // STEP 5: Update subtopic masteries