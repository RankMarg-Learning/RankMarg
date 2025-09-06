// import { BaseRepository } from "./base.repository";
// import {
//   Activity,
//   ActivityQuery,
//   ActivityResponse,
// } from "../types/profile.types";
// import { PaginationMeta, ApiError, ErrorCode } from "../types/common";

// export class ActivityRepository extends BaseRepository {
//   protected getTableName(): string {
//     return "activity";
//   }

//   async getUserActivities(
//     userId: string,
//     query: ActivityQuery
//   ): Promise<ActivityResponse> {
//     try {
//       const whereClause: any = {
//         userId,
//         ...(query.type && { type: query.type }),
//       };

//       // Add date filtering if provided
//       if (query.dateFrom || query.dateTo) {
//         whereClause.createdAt = {
//           ...(query.dateFrom && { gte: new Date(query.dateFrom) }),
//           ...(query.dateTo && { lte: new Date(query.dateTo) }),
//         };
//       }

//       const { data, pagination } = await this.executePaginatedQuery<Activity>(
//         query,
//         {
//           where: whereClause,
//           select: {
//             id: true,
//             type: true,
//             message: true,
//             earnCoin: true,
//             createdAt: true,
//             metadata: true,
//           },
//           orderBy: {
//             createdAt: query.sortOrder || "desc",
//           },
//         }
//       );

//       const transformedData = data.map((activity) => ({
//         id: activity.id,
//         type: activity.type,
//         message: activity.message,
//         earnCoin: activity.earnCoin,
//         createdAt: activity.createdAt,
//         metadata: (activity as any).metadata || undefined,
//       }));

//       return {
//         activities: transformedData,
//         pagination: {
//           total: pagination.totalItems,
//           page: pagination.currentPage,
//           limit: pagination.itemsPerPage,
//           pages: pagination.totalPages,
//         },
//       };
//     } catch (error) {
//       console.error("Error fetching user activities:", error);
//       throw new ApiError(
//         ErrorCode.INTERNAL_ERROR,
//         "Failed to fetch user activities",
//         500,
//         error
//       );
//     }
//   }

//   async createActivity(
//     userId: string,
//     type: string,
//     message: string,
//     earnCoin: number = 0,
//     metadata?: Record<string, unknown>
//   ): Promise<Activity> {
//     try {
//       const activity = await this.prisma.activity.create({
//         data: {
//           userId,
//           type,
//           message,
//           earnCoin,
//         },
//         select: {
//           id: true,
//           type: true,
//           message: true,
//           earnCoin: true,
//           createdAt: true,
//         },
//       });

//       return {
//         id: activity.id,
//         type: activity.type,
//         message: activity.message,
//         earnCoin: activity.earnCoin,
//         createdAt:
//           activity.createdAt instanceof Date
//             ? activity.createdAt.toISOString()
//             : activity.createdAt,
//         metadata: metadata || undefined,
//       };
//     } catch (error) {
//       console.error("Error creating activity:", error);
//       throw new ApiError(
//         ErrorCode.INTERNAL_ERROR,
//         "Failed to create activity",
//         500,
//         error
//       );
//     }
//   }

//   async getActivityStats(userId: string): Promise<{
//     totalActivities: number;
//     totalCoinsEarned: number;
//     activitiesByType: Record<string, number>;
//     recentActivityCount: number;
//   }> {
//     try {
//       const sevenDaysAgo = new Date();
//       sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

//       const [
//         totalActivities,
//         coinsStats,
//         activitiesByType,
//         recentActivityCount,
//       ] = await Promise.all([
//         // Total activities count
//         this.prisma.activity.count({
//           where: { userId },
//         }),

//         // Total coins earned
//         this.prisma.activity.aggregate({
//           where: { userId },
//           _sum: { earnCoin: true },
//         }),

//         // Activities by type
//         this.prisma.activity.groupBy({
//           by: ["type"],
//           where: { userId },
//           _count: { type: true },
//         }),

//         // Recent activities (last 7 days)
//         this.prisma.activity.count({
//           where: {
//             userId,
//             createdAt: { gte: sevenDaysAgo },
//           },
//         }),
//       ]);

//       const activitiesByTypeMap = activitiesByType.reduce(
//         (acc, item) => {
//           acc[item.type] = item._count.type;
//           return acc;
//         },
//         {} as Record<string, number>
//       );

//       return {
//         totalActivities,
//         totalCoinsEarned: coinsStats._sum.earnCoin || 0,
//         activitiesByType: activitiesByTypeMap,
//         recentActivityCount,
//       };
//     } catch (error) {
//       console.error("Error fetching activity stats:", error);
//       throw new ApiError(
//         ErrorCode.INTERNAL_ERROR,
//         "Failed to fetch activity statistics",
//         500,
//         error
//       );
//     }
//   }
// }
