import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import MarkdownRenderer from "@/lib/MarkdownRenderer";
import { QuestionTableProps } from "@/types";
import Link from "next/link";

export const QTableRow = ({ problem }: { problem: QuestionTableProps }) => {
  return (
    <TableRow key={problem.id} className="sm:text-sm">
     
      <TableCell className="hidden md:table-cell"    >{problem.class}</TableCell>
      
      <TableCell className="hidden md:table-cell">
        <Badge
          variant={
            problem.difficulty as
              | "default"
              | "Easy"
              | "Medium"
              | "Hard"
              | "destructive"
              | "outline"
              | "secondary"
              | null
              | undefined
          }
        >
          {problem.difficulty}
        </Badge>
      </TableCell>
      <TableCell className="font-medium  md:table-cell ">
        <Link
          href={`/question/${problem.slug}`}
          className="hover:text-yellow-600 flex flex-wrap"
        >
          <MarkdownRenderer content={problem.title.slice(0,80)} />
        </Link>
      </TableCell>
      <TableCell className=" md:table-cell">
      <Badge
          variant={
            "outline"
          }
        >{problem.subject}
        </Badge>
        </TableCell>
     
      
      <TableCell className="hidden md:table-cell">
        {/* <Badge
          variant={
            "secondary"
          }
        > */}
          {problem.topic}
        {/* </Badge> */}
      </TableCell>
      <TableCell className="hidden">{problem.accuracy}%</TableCell>
     
      
    </TableRow>
  );
};