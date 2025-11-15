import { Skeleton } from "@repo/common-ui";

export default function CurriculumSkeleton() {
	return (
		<div className="container mx-auto px-4 py-6 space-y-6">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<Skeleton className="h-6 w-40" />
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 w-full sm:w-auto">
					<Skeleton className="h-6 w-48" />
					<Skeleton className="h-10 w-full sm:w-64" />
				</div>
			</div>

			<Skeleton className="p-4 space-y-4">
				<div className="flex items-center justify-between">
					<Skeleton className="h-5 w-24" />
					<Skeleton className="h-5 w-40" />
				</div>
				<Skeleton className="h-4 w-full" />
				<div className="space-y-3">
					{Array.from({ length: 6 }).map((_, idx) => (
						<Skeleton key={idx} className="rounded-md  p-3">
							<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
								<div className="flex items-center gap-3 min-w-0">
									<div className="space-y-1 w-full">
										<Skeleton className="h-4 w-40" />
										<Skeleton className="h-3 w-28" />
									</div>
								</div>
								<div className="flex items-center gap-3">
									<Skeleton className="h-6 w-16" />
									<Skeleton className="h-9 w-28" />
								</div>
							</div>
						</Skeleton>
					))}
				</div>
			</Skeleton>
		</div>
	);
}


