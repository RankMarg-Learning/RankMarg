"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@repo/common-ui";
import { useInteractionData } from "@/hooks/useInteractionData";
import { Download, Loader2, Settings, BarChart2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function InteractionPage() {
  const [filterType, setFilterType] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const { interactions, total, isLoading } = useInteractionData(filterType, page);

  const exportToCSV = () => {
    if (!interactions || interactions.length === 0) return;

    const headers = ["ID", "User Name", "User Email", "User Phone", "Interaction Type", "Key", "Data", "Created At"];

    const rows = interactions.map((item: any) => [
      item.id,
      item.user?.name || "N/A",
      item.user?.email || "N/A",
      item.user?.phone || "N/A",
      item.type,
      item.key,
      JSON.stringify(item.data).replace(/"/g, '""'), // Escape quotes for CSV
      format(new Date(item.createdAt), "yyyy-MM-dd HH:mm:ss")
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `interactions_${filterType.toLowerCase()}_${format(new Date(), "yyyyMMdd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Interactions</h1>
          <p className="text-sm text-gray-500">Monitor and export poll responses and form submissions.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/interaction/config">
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Config
            </Button>
          </Link>
          <Button onClick={exportToCSV} disabled={!interactions?.length} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export to CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
            <div className="w-full md:w-48">
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Filter By Type</label>
              <Select value={filterType} onValueChange={(val) => { setFilterType(val); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Interactions</SelectItem>
                  <SelectItem value="POLL">Poll Responses Only</SelectItem>
                  <SelectItem value="FORM">Form Submissions Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {filterType !== "FORM" && interactions && interactions.length > 0 && (
              <div className="flex-1 w-full">
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Quick Stats</label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                    Showing: {interactions.filter((i: any) => i.type === "POLL").length} Polls
                  </Badge>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100">
                    Total in DB: {total}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Poll Summary Section */}
          {(filterType === "ALL" || filterType === "POLL") && interactions && interactions.length > 0 && (
            <div className="mb-8 space-y-4">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <BarChart2 className="w-4 h-4" />
                Poll Analytics (Latest Sample)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from(new Set(interactions.filter((i: any) => i.type === "POLL").map((i: any) => i.data.pollId))).map((pollId: any) => {
                  const pollResponses = interactions.filter((i: any) => i.type === "POLL" && i.data.pollId === pollId);
                  const question = pollResponses[0]?.data.question || pollId;
                  const totalPoll = pollResponses.length;
                  
                  // Aggregate options
                  const counts: Record<string, number> = {};
                  pollResponses.forEach((r: any) => {
                    counts[r.data.answer] = (counts[r.data.answer] || 0) + 1;
                  });

                  return (
                    <div key={pollId} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-sm font-bold text-gray-900 leading-snug">{question}</h4>
                        <Badge className="bg-white text-gray-500 border-gray-200 text-[10px] whitespace-nowrap">
                          {totalPoll} samples
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([opt, count]) => {
                          const percent = Math.round((count / totalPoll) * 100);
                          return (
                            <div key={opt} className="space-y-1">
                              <div className="flex justify-between text-[11px] font-medium">
                                <span className="text-gray-600 truncate max-w-[80%]">{opt}</span>
                                <span className="text-gray-900">{count} ({percent}%)</span>
                              </div>
                              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary-500 rounded-full transition-all duration-500" 
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="rounded-md border border-gray-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-700">User</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-center">Type</TableHead>
                  <TableHead className="font-semibold text-gray-700">Interaction Details</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-48 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                        <span>Loading interactions...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : interactions?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-48 text-center text-gray-500">
                      No interactions found for the selected filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  interactions.map((item: any) => (
                    <TableRow key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{item.user?.name || "Unknown User"}</span>
                          <span className="text-xs text-gray-500">{item.user?.email || "No email"}</span>
                          <span className="text-xs text-gray-400 font-mono mt-0.5">{item.user?.phone || "No phone"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <Badge
                          variant="outline"
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-tight",
                            item.type === "POLL"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          )}
                        >
                          {item.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 max-w-md">
                        <div className="text-sm">
                          {item.type === "POLL" ? (
                            <div className="space-y-1">
                              <p className="font-medium text-gray-800 italic">"{item.data.question}"</p>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-gray-500">Answer:</span>
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-semibold px-2 py-0 text-[11px] h-auto">
                                  {item.data.answer}
                                </Badge>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {item.data.formId && <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Form ID: {item.data.formId}</p>}
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 p-2.5 bg-gray-50/80 rounded-lg border border-gray-100">
                                {Object.entries(item.data.values || {}).map(([key, val]: [string, any]) => (
                                  <div key={key} className="flex flex-col">
                                    <span className="text-[10px] uppercase text-gray-400 font-bold">{key.replace(/_/g, " ")}</span>
                                    <span className="text-sm text-gray-700 font-medium truncate">{String(val)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-medium text-gray-700">{format(new Date(item.createdAt), "MMM dd, yyyy")}</span>
                          <span className="text-[10px] text-gray-400 font-mono">{format(new Date(item.createdAt), "HH:mm:ss")}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Simple Pagination */}
          {total > 50 && (
            <div className="flex items-center justify-between mt-6 px-2">
              <p className="text-sm text-gray-500">
                Total {total} interactions
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={page * 50 >= total}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
