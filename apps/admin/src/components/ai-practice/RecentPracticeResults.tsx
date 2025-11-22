import { Card, CardContent } from "@repo/common-ui";
import { Badge } from "@repo/common-ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/common-ui";
import { PracticeSession } from "@/types/dashboard.types";
import { SubjectIcons, SubjectTextColor } from "@/constant/SubjectColorCode";
import { DateFormator } from "@/utils/dateFormator";
import Link from "next/link";
import { timeFormator } from "@/utils/timeFormatter";



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
        { !allResults && (<a href="/ai-practice/recent-results" className="text-primary-600 text-sm font-semibold hover:underline"> View All</a>)}
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
            {results?.length>0? results?.map((result, index) => (

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
                <TableCell>{DateFormator(result?.date,"date")}</TableCell>
                <TableCell>{result?.score}</TableCell>
                <TableCell>
                  <Badge variant={result?.accuracy >= 80 ? "Easy" : "Medium"}>
                    {result?.accuracy}%
                  </Badge>
                </TableCell>
                <TableCell>{timeFormator(Number(result?.duration),{from:'sec',to:['min','sec']})}</TableCell>
                <TableCell>
                  <Link href={`/ai-session/${result?.id}?review=true&loc=ai_practice_page`} className="text-primary-600 hover:underline">Review</Link>
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
