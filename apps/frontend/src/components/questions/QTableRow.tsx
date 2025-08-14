import { Badge } from "@/components/ui/badge";
import { TableCell } from "@/components/ui/table";
import { QuestionTableProps } from "@/types";
import { CircleCheck } from "lucide-react";
import Link from "next/link";

const difficultyMap: Record<number, "Easy" | "Medium" | "Hard" | "default"> = {
  1: "Easy",
  2: "Medium",
  3: "Hard",
  4: "default",
};
export const QTableRow = ({ problem, isPublished }: { problem: QuestionTableProps, isPublished?: boolean }) => {
  return (
    <>

      <TableCell className={`${!isPublished ? "" : "hidden"}`}>{problem.attempts.length > 0 ? (<CircleCheck className="text-green-400" />) : ("")}</TableCell>
      {/* <TableCell  >{TextFormator(problem.class)}</TableCell> */}

      <TableCell >
        <Badge variant={difficultyMap[problem.difficulty] || "default"}>
          {difficultyMap[problem.difficulty] || "Unknown"}
        </Badge>
      </TableCell>
      <TableCell className="font-medium  md:table-cell ">
        <Link
          href={`/question/${problem.slug}`}
          target={`${isPublished ? "_blank" : "_self"}`}
          className="hover:text-primary-600 "
        >
          <div className="truncate  max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[500px] xl:max-w-[600px]">
            {problem.title}

          </div>
        </Link>
      </TableCell>
      <TableCell className=" md:table-cell">
        <Badge
          variant={
            "outline"
          }
        >{problem.subject.name}
        </Badge>
      </TableCell>


      <TableCell className=" md:table-cell">
        {/* <Badge
          variant={
            "secondary"
          }
        > */}
        <div className="truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[500px] xl:max-w-[600px]">
          {problem.topic.name}
        </div>
        {/* </Badge> */}
      </TableCell>
      {/* <TableCell className="hidden">{problem.accuracy}%</TableCell> */}


    </>
  );
};