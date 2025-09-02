import { PrismaClient } from "@prisma/client";
import prisma from "../lib/prisma";
import { PaginationQuery, PaginationMeta } from "../types/common";

export abstract class BaseRepository {
  protected prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  protected createPaginationMeta(
    query: PaginationQuery,
    totalItems: number
  ): PaginationMeta {
    const totalPages = Math.ceil(totalItems / query.limit);

    return {
      currentPage: query.page,
      totalPages,
      totalItems,
      itemsPerPage: query.limit,
      hasNextPage: query.page < totalPages,
      hasPreviousPage: query.page > 1,
    };
  }

  protected calculateSkip(query: PaginationQuery): number {
    return (query.page - 1) * query.limit;
  }

  protected buildOrderBy(
    query: PaginationQuery
  ): Record<string, any> | undefined {
    if (!query.sortBy) return undefined;

    return {
      [query.sortBy]: query.sortOrder,
    };
  }

  protected async executePaginatedQuery<T>(
    query: PaginationQuery,
    findManyArgs: any,
    countArgs?: any
  ): Promise<{ data: T[]; pagination: PaginationMeta }> {
    const skip = this.calculateSkip(query);
    const orderBy = this.buildOrderBy(query);

    const [data, total] = await Promise.all([
      this.prisma[this.getTableName()].findMany({
        ...findManyArgs,
        skip,
        take: query.limit,
        orderBy,
      }),
      this.prisma[this.getTableName()].count(
        countArgs || { where: findManyArgs.where }
      ),
    ]);

    return {
      data,
      pagination: this.createPaginationMeta(query, total),
    };
  }

  protected abstract getTableName(): string;
}
