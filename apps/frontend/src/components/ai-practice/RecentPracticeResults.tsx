import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PracticeSession } from "@/types/dashboard.types";
import { SubjectIcons, SubjectTextColor } from "@/constant/SubjectColorCode";
import Link from "next/link";



const renderIcon = (title: string) => {
  const key = title.toLowerCase();
  const Icon = SubjectIcons[key as keyof typeof SubjectIcons] || SubjectIcons.default;
  const colorClass = SubjectTextColor[key as keyof typeof SubjectTextColor] || SubjectTextColor.default;

  return <Icon className={`w-6 h-6 ${colorClass}`} />;
};

export default function RecentPracticeResults({ results ,allResults=false}: { results: PracticeSession[],allResults?:Boolean }) {
  return (
    <Card className="w-full p-4 border-0">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Recent Practice Results</h2>
        { !allResults && (<Link href={`ai-practice/recentResults`} className="text-primary-600 text-sm font-semibold hover:underline">View All</Link>)}
      </div>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Session</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Accuracy</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.length>0? results.map((result, index) => (

              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {renderIcon(result?.title)}
                    <div>
                      <p className="font-medium">{result.title}</p>
                      <p className="text-sm text-gray-500">{result?.keySubtopics}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{new Date(result.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}</TableCell>
                <TableCell>{result.score}</TableCell>
                <TableCell>
                  <Badge variant={result.accuracy >= 80 ? "Easy" : "Medium"}>
                    {result.accuracy}%
                  </Badge>
                </TableCell>
                <TableCell>{result.duration}</TableCell>
                <TableCell>
                  <Link href={`/ai-session/${result.id}?review=true&loc=ai_practice_page`} className="text-primary-600 hover:underline">Review</Link>
                </TableCell>
              </TableRow>
            )):(
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                  No recent practice results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
