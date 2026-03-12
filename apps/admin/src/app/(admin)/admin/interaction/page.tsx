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
import { Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function InteractionPage() {
  const [filterType, setFilterType] = useState<string>("ALL");
  const { data: interactions, isLoading } = useInteractionData(filterType);

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
        <Button onClick={exportToCSV} disabled={!interactions?.length} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export to CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-48">
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Filter By Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
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
          </div>

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
        </CardContent>
      </Card>
    </div>
  );
}
