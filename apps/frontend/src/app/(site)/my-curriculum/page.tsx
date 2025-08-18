"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utils/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { useSubjects } from "@/hooks/useSubject";
import { useTopics } from "@/hooks/useTopics";
import { CheckCircle2, Circle, PlayCircle } from "lucide-react";
import CurriculumSkeleton from "@/components/skeleton/curriculum.skeleton";

type CurrentState = {
	topicId: string;
	isCurrent: boolean;
	isCompleted: boolean;
};

export default function MyCurriculumPage() {
	const { data: session } = useSession();
	const queryClient = useQueryClient();

	const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");

	const { subjects, isLoading: isLoadingSubjects } = useSubjects(session?.user?.examCode || "NEET");
	const { topics, isLoading: isLoadingTopics } = useTopics(selectedSubjectId);

	const { data: currentTopicStates, isLoading: isLoadingStates } = useQuery({
		queryKey: ["current-topic-states", selectedSubjectId],
		queryFn: async () => {
			if (!selectedSubjectId) return [] as CurrentState[];
			const { data } = await api.get(`/current-topic?subjectId=${selectedSubjectId}`);
			return (data?.data || []) as CurrentState[];
		},
		enabled: !!selectedSubjectId,
		staleTime: 60_000,
		gcTime: 5 * 60_000,
		refetchOnWindowFocus: false,
	});

// Global current-topic states not required for per-subject cap; remove to keep UI lean

	const currentMap = useMemo(() => {
		const map = new Map<string, CurrentState>();
		(currentTopicStates || []).forEach((s) => map.set(s.topicId, s));
		return map;
	}, [currentTopicStates]);

	const splitByStatus = useMemo(() => {
		const all = (topics?.data || []) as Array<any>;
		const current: any[] = [];
		const completed: any[] = [];
		const pending: any[] = [];
		all.forEach((t) => {
			const st = currentMap.get(t.id);
			if (st?.isCurrent) current.push(t);
			else if (st?.isCompleted) completed.push(t);
			else pending.push(t);
		});

		return { current, pending, completed };
	}, [topics?.data, currentMap]);

// Note: per-subject cap is displayed; global states kept for future use if needed

	const setCurrentMutation = useMutation({
		mutationFn: async ({ subjectId, topicId }: { subjectId: string; topicId: string }) => {
			return (await api.put(`/current-topic`, { subjectId, topicId })).data;
		},
		onSuccess: async (res) => {
			if (res?.success) {
				toast({ title: "Current topic updated", variant: "default" });
				await Promise.all([
					queryClient.invalidateQueries({ queryKey: ["current-topic-states", selectedSubjectId] }),
					queryClient.invalidateQueries({ queryKey: ["current-topic-global"] }),
					queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
				]);
			} else {
				toast({ title: res?.message || "Failed to update", className: "bg-red-500 text-white" });
			}
		},
		onError: (err: any) => {
			toast({ title: err?.response?.data?.message || err?.message || "Failed", className: "bg-red-500 text-white" });
		},
	});

	const setCompletedMutation = useMutation({
		mutationFn: async ({ subjectId, topicId, isCompleted }: { subjectId: string; topicId: string; isCompleted: boolean }) => {
			return (await api.patch(`/current-topic`, { subjectId, topicId, isCompleted })).data;
		},
		onSuccess: async (res) => {
			if (res?.success) {
				await queryClient.invalidateQueries({ queryKey: ["current-topic-states", selectedSubjectId] });
			} else {
				toast({ title: res?.message || "Failed to update", className: "bg-red-500 text-white" });
			}
		},
		onError: (err: any) => {
			toast({ title: err?.response?.data?.message || err?.message || "Failed", className: "bg-red-500 text-white" });
		},
	});

	useEffect(() => {
		if (!selectedSubjectId && subjects?.data?.length) {
			setSelectedSubjectId(subjects.data[0].id);
		}
	}, [subjects?.data, selectedSubjectId]);

	if (isLoadingSubjects || isLoadingTopics || isLoadingStates) {
		return <CurriculumSkeleton />;
	}

	return (
		<div className="container mx-auto px-4 py-6 space-y-6">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="text-lg font-semibold sm:text-xl">My Curriculum</h1>
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 w-full sm:w-auto">
					<Badge className="w-full sm:w-auto justify-center" variant="outline">Current in subject: {splitByStatus.current.length}/2</Badge>
					<div className="w-full sm:w-64">
						<Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select subject" />
							</SelectTrigger>
							<SelectContent>
								{subjects?.data?.map((s: any) => (
									<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>

			<Card className="p-4">
				<div className="flex items-center justify-between">
					<h2 className="font-medium">Topics</h2>
					<span className="sr-only">Topics list</span>
				</div>
				<Separator className="my-3" />
				{splitByStatus.current.length >= 2 && (
					<div className="mb-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-800 text-xs">
						You already have 2 current topics in this subject. You must mark one as done before selecting another current topic.
					</div>
				)}
				<div className="space-y-6">
					{/* Current */}
					<div>
						<div className="flex items-center gap-2 mb-2">
							<PlayCircle className="h-4 w-4 text-green-600" />
							<h3 className="text-sm font-medium text-green-700">Current</h3>
							<Badge variant="outline">{splitByStatus.current.length}</Badge>
						</div>
						<div className="space-y-2">
							{splitByStatus.current.length === 0 ? (
								<p className="text-xs text-muted-foreground">No current topic selected.</p>
							) : (
								splitByStatus.current.map((t: any) => (
									<Row
										key={t.id}
										status="current"
										topic={t}
										isCompleted={!!currentMap.get(t.id)?.isCompleted}
										onMakeCurrent={() => setCurrentMutation.mutate({ subjectId: selectedSubjectId, topicId: t.id })}
										onToggleDone={(checked) => setCompletedMutation.mutate({ subjectId: selectedSubjectId, topicId: t.id, isCompleted: checked })}
										disableMakeCurrent={false}
									/>
								))
							)}
						</div>
					</div>

					{/* Pending */}
					<div>
						<div className="flex items-center gap-2 mb-2">
							<Circle className="h-4 w-4 text-amber-600" />
							<h3 className="text-sm font-medium text-amber-700">Pending</h3>
							<Badge variant="outline">{splitByStatus.pending.length}</Badge>
						</div>
						<div className="space-y-2">
							{splitByStatus.pending.length === 0 ? (
								<p className="text-xs text-muted-foreground">Nothing pending.</p>
							) : (
								splitByStatus.pending.map((t: any) => (
									<Row
										key={t.id}
										status="pending"
										topic={t}
										isCompleted={!!currentMap.get(t.id)?.isCompleted}
										onMakeCurrent={() => setCurrentMutation.mutate({ subjectId: selectedSubjectId, topicId: t.id })}
										onToggleDone={(checked) => setCompletedMutation.mutate({ subjectId: selectedSubjectId, topicId: t.id, isCompleted: checked })}
										disableMakeCurrent={splitByStatus.current.length >= 2}
									/>
								))
							)}
						</div>
					</div>

					{/* Completed */}
					<div>
						<div className="flex items-center gap-2 mb-2">
							<CheckCircle2 className="h-4 w-4 text-gray-600" />
							<h3 className="text-sm font-medium text-gray-700">Completed</h3>
							<Badge variant="outline">{splitByStatus.completed.length}</Badge>
						</div>
						<div className="space-y-2">
							{splitByStatus.completed.length === 0 ? (
								<p className="text-xs text-muted-foreground">No completed topics yet.</p>
							) : (
								splitByStatus.completed.map((t: any) => (
									<Row
										key={t.id}
										status="completed"
										topic={t}
										isCompleted={true}
										onMakeCurrent={() => setCurrentMutation.mutate({ subjectId: selectedSubjectId, topicId: t.id })}
										onToggleDone={(checked) => setCompletedMutation.mutate({ subjectId: selectedSubjectId, topicId: t.id, isCompleted: checked })}
										disableMakeCurrent={splitByStatus.current.length >= 2}
									/>
								))
							)}
						</div>
					</div>
				</div>
			</Card>
		</div>
	);
}


type RowProps = {
	status: "current" | "pending" | "completed";
	topic: any;
	isCompleted: boolean;
	onMakeCurrent: () => void;
	onToggleDone: (checked: boolean) => void;
	disableMakeCurrent?: boolean;
};

function Row({ status, topic, isCompleted, onMakeCurrent, onToggleDone, disableMakeCurrent }: RowProps) {
	const isCurrent = status === "current";
	const base = "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-md border p-3";
	const styles = isCurrent
		? "border-green-200 bg-green-50"
		: status === "completed"
		? "border-gray-200 bg-gray-50"
		: "border-amber-100 bg-amber-50";

	return (
		<div className={`${base} ${styles}`}>
			<div className="flex items-center gap-3 min-w-0">
				{/* Removed orderIndex badge for a cleaner, faster UI */}
				<div className="truncate">
					<p className="font-medium truncate">{topic.name}</p>
					<p className="text-xs text-muted-foreground truncate">Estimated: {topic.estimatedMinutes ?? "-"} mins</p>
				</div>
			</div>
			<div className="flex items-center gap-3 justify-between sm:justify-end">
				<div className="flex items-center gap-2">
					<Switch checked={isCompleted} onCheckedChange={onToggleDone} />
					<span className="text-xs">Done</span>
				</div>
				<Button variant={isCurrent ? "default" : "outline"} disabled={isCurrent || !!disableMakeCurrent} onClick={onMakeCurrent}>
					{isCurrent ? "Current" : "Make Current"}
				</Button>
			</div>
		</div>
	);
}


