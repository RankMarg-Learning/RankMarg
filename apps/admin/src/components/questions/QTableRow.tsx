import { Badge } from "@repo/common-ui";
import { TableCell } from "@repo/common-ui";
import { QuestionTableProps } from "@/types";
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
        <div className="truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[500px] xl:max-w-[600px]">
          {problem.topic.name}
        </div>
      </TableCell>


    </>
  );
};