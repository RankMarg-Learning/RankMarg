// import { BaseRepository } from "./base.repository";
// import { StudyTopic, CurrentStudiesQuery } from "../types/profile.types";
// import { PaginationMeta, ApiError, ErrorCode } from "../types/common";

// export class CurriculumRepository extends BaseRepository {
//   protected getTableName(): string {
//     return "currentStudyTopic";
//   }

//   async getCurrentStudies(
//     userId: string,
//     query: CurrentStudiesQuery
//   ): Promise<{ data: StudyTopic[]; pagination?: PaginationMeta }> {
//     try {
//       // Handle unique subjects case
//       if (query.uniqueSubjects) {
//         return this.getUniqueSubjects(userId, query);
//       }

//       const whereClause = {
//         userId,
//         ...(query.subjectId && { subjectId: query.subjectId }),
//         ...(query.topicId && { topicId: query.topicId }),
//         ...(query.isCurrent && { isCurrent: true }),
//         ...(query.includeCompleted === true ? {} : { isCompleted: false }),
//       };

//       const { data, pagination } = await this.executePaginatedQuery<StudyTopic>(
//         query,
//         {
//           where: whereClause,
//           select: {
//             id: true,
//             isCurrent: true,
//             isCompleted: true,
//             startedAt: true,
//             subjectId: true,
//             subject: {
//               select: {
//                 id: true,
//                 name: true,
//               },
//             },
//             topic: {
//               select: {
//                 id: true,
//                 name: true,
//               },
//             },
//           },
//           orderBy: {
//             startedAt: query.sortOrder || "desc",
//           },
//         }
//       );

//       const transformedData = data.map((item) => ({
//         id: item.id,
//         isCurrent: item.isCurrent,
//         isCompleted: item.isCompleted,
//         startedAt: item.startedAt.toISOString(),
//         subjectId: item.subjectId,
//         subjectName: item.subject?.name || "",
//         topicName: item.topic?.name || "",
//       }));

//       return { data: transformedData, pagination };
//     } catch (error) {
//       console.error("Error fetching current studies:", error);
//       throw new ApiError(
//         ErrorCode.INTERNAL_ERROR,
//         "Failed to fetch current studies",
//         500,
//         error
//       );
//     }
//   }

//   private async getUniqueSubjects(
//     userId: string,
//     query: CurrentStudiesQuery
//   ): Promise<{ data: StudyTopic[] }> {
//     try {
//       const allTopics = await this.prisma.currentStudyTopic.findMany({
//         where: {
//           userId,
//           ...(query.includeCompleted ? {} : { isCompleted: false }),
//         },
//         orderBy: {
//           startedAt: "desc",
//         },
//         select: {
//           id: true,
//           isCurrent: true,
//           isCompleted: true,
//           startedAt: true,
//           subjectId: true,
//           subject: {
//             select: {
//               id: true,
//               name: true,
//             },
//           },
//           topic: {
//             select: {
//               id: true,
//               name: true,
//             },
//           },
//         },
//       });

//       // Create a Map to ensure unique subjects (latest entry per subject)
//       const subjectMap = new Map<number, StudyTopic>();

//       allTopics.forEach((item) => {
//         if (!item.subject?.id || !item.subject?.name || !item.topic?.name) {
//           return; // Skip incomplete data
//         }

//         const subjectId = item.subject.id;

//         if (!subjectMap.has(subjectId)) {
//           subjectMap.set(subjectId, {
//             id: item.id,
//             isCurrent: item.isCurrent,
//             isCompleted: item.isCompleted,
//             startedAt: item.startedAt.toISOString(),
//             subjectId: item.subjectId,
//             subjectName: item.subject.name,
//             topicName: item.topic.name,
//           });
//         }
//       });

//       const uniqueSubjects = Array.from(subjectMap.values());

//       return { data: uniqueSubjects };
//     } catch (error) {
//       console.error("Error fetching unique subjects:", error);
//       throw new ApiError(
//         ErrorCode.INTERNAL_ERROR,
//         "Failed to fetch unique subjects",
//         500,
//         error
//       );
//     }
//   }

//   async createStudyTopic(
//     userId: string,
//     subjectId: number,
//     topicId: number
//   ): Promise<StudyTopic> {
//     try {
//       const studyTopic = await this.prisma.currentStudyTopic.create({
//         data: {
//           userId,
//           subjectId,
//           topicId,
//           isCurrent: true,
//           isCompleted: false,
//           startedAt: new Date(),
//         },
//         select: {
//           id: true,
//           isCurrent: true,
//           isCompleted: true,
//           startedAt: true,
//           subjectId: true,
//           subject: {
//             select: {
//               name: true,
//             },
//           },
//           topic: {
//             select: {
//               name: true,
//             },
//           },
//         },
//       });

//       return {
//         id: studyTopic.id,
//         isCurrent: studyTopic.isCurrent,
//         isCompleted: studyTopic.isCompleted,
//         startedAt: studyTopic.startedAt.toISOString(),
//         subjectId: studyTopic.subjectId,
//         subjectName: studyTopic.subject?.name || "",
//         topicName: studyTopic.topic?.name || "",
//       };
//     } catch (error) {
//       console.error("Error creating study topic:", error);
//       throw new ApiError(
//         ErrorCode.INTERNAL_ERROR,
//         "Failed to create study topic",
//         500,
//         error
//       );
//     }
//   }

//   async updateStudyTopic(
//     userId: string,
//     studyTopicId: string,
//     updateData: Partial<StudyTopic>
//   ): Promise<StudyTopic> {
//     try {
//       const studyTopic = await this.prisma.currentStudyTopic.update({
//         where: {
//           id: studyTopicId,
//           userId, // Ensure user owns this study topic
//         },
//         data: {
//           ...(updateData.isCurrent !== undefined && {
//             isCurrent: updateData.isCurrent,
//           }),
//           ...(updateData.isCompleted !== undefined && {
//             isCompleted: updateData.isCompleted,
//           }),
//         },
//         select: {
//           id: true,
//           isCurrent: true,
//           isCompleted: true,
//           startedAt: true,
//           subjectId: true,
//           subject: {
//             select: {
//               name: true,
//             },
//           },
//           topic: {
//             select: {
//               name: true,
//             },
//           },
//         },
//       });

//       return {
//         id: studyTopic.id,
//         isCurrent: studyTopic.isCurrent,
//         isCompleted: studyTopic.isCompleted,
//         startedAt: studyTopic.startedAt.toISOString(),
//         subjectId: studyTopic.subjectId,
//         subjectName: studyTopic.subject?.name || "",
//         topicName: studyTopic.topic?.name || "",
//       };
//     } catch (error) {
//       console.error("Error updating study topic:", error);
//       throw new ApiError(
//         ErrorCode.INTERNAL_ERROR,
//         "Failed to update study topic",
//         500,
//         error
//       );
//     }
//   }
// }
