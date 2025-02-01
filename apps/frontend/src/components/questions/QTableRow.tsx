import { Badge } from "@/components/ui/badge";
import { TableCell } from "@/components/ui/table";
import { QuestionTableProps } from "@/types";
import { CircleCheck } from "lucide-react";
import Link from "next/link";

export const QTableRow = ({ problem, isPublished }: { problem: QuestionTableProps, isPublished?: boolean }) => {
  return (
    <>

      <TableCell className={`${!isPublished ? "" : "hidden"}`}>{problem.attempts.length > 0 ? (<CircleCheck className="text-green-400" />) : ("")}</TableCell>
      <TableCell  >{problem.class}</TableCell>

      <TableCell >
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
          target={`${isPublished ? "_blank" : "_self"}`}
          className="hover:text-yellow-600 "
        >
          <div className="truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[500px] xl:max-w-[600px]">
            {problem.title}

          </div>
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


      <TableCell className=" md:table-cell">
        {/* <Badge
          variant={
            "secondary"
          }
        > */}
        <div className="truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[500px] xl:max-w-[600px]">
          {problem.topic}
        </div>
        {/* </Badge> */}
      </TableCell>
      <TableCell className="hidden">{problem.accuracy}%</TableCell>


    </>
  );
};