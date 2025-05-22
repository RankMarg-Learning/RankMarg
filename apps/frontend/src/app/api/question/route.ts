import prisma from "@/lib/prisma";
import { ClassEnum, Prisma, QuestionType, Stream } from "@prisma/client";
import { QCategory, Question } from "@/types/typeAdmin";
import { jsonResponse } from "@/utils/api-response";
import { SubmitStatus } from "@prisma/client";
import { getAuthSession } from "@/utils/session";

interface WhereClauseProps {
  subjectId?: string;
  topicId?: string;
  subtopicId?: string;
  difficulty?: number;
  category?: Prisma.QuestionCategoryListRelationFilter;
  stream?: Stream;
  class?: ClassEnum;
  pyqYear?: string;
  isPublished?: boolean;
  type?: QuestionType;
  OR?: Array<Prisma.QuestionWhereInput>;
}

export async function GET(req: Request) {
  const limit = 25;
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const subjectId = searchParams.get("subjectId");
  const topicId = searchParams.get("topicId");
  const subtopicId = searchParams.get("subtopicId");
  const difficulty = parseInt(searchParams.get("difficulty") , 10);
  const category = searchParams.get("category") as QCategory;
  const className = searchParams.get("class") as ClassEnum;
  const pyqYear = searchParams.get("pyqYear");
  const stream = searchParams.get("stream") as Stream;
  const type = searchParams.get("type") as QuestionType;
  const search = searchParams.get("search");
  const isPublished = searchParams.get("isPublished") === "true";
  const skip = (page - 1) * limit;

  try {
    const whereClause: WhereClauseProps = {};

    
    if (subjectId) whereClause.subjectId = subjectId;
    if (topicId) whereClause.topicId = topicId;
    if (subtopicId) whereClause.subtopicId = subtopicId;
    if (difficulty) whereClause.difficulty = difficulty;
    if (category) {
      whereClause.category = {
        some: {
          category: category, 
        },
      };
    }
    if (className) whereClause.class = className;
    if (pyqYear) whereClause.pyqYear = pyqYear;
    if (stream) whereClause.stream = stream;
    if (type) whereClause.type = type;
    
    if (search) {
      whereClause.OR = [
        { content: { contains: search, mode: "insensitive" } },
        { topic: { name: { contains: search, mode: "insensitive" } } },
        { subTopic: { name: { contains: search, mode: "insensitive" } } },
      ];
    }
    
    const session = await getAuthSession()
    let userID = session?.user?.id || "default-user-id";

    if (isPublished !== undefined) {
      whereClause.isPublished = isPublished;
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
          format: true,
          content: true,
          difficulty: true,
          isPublished:true,
          class: true,
          stream: true,
          
          pyqYear: true,
          createdBy: true,
          createdAt: true,
          attempts: {
            where: { userId: userID, status: SubmitStatus.CORRECT }, // TODO: WATCHDOG 
            select: { id: true },
          },
          topic: {
            select: {  name: true },
          },
          subTopic: {
            select: {  name: true },
          },
          subject: {
            select: {  name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.question.count({ where: whereClause }),
    ]);

    const currentPage = Math.ceil(total / limit);

    return jsonResponse(
      { questions, currentPage, totalPages:total },
      { success: true, message: "Ok", status: 200 }
    )
  } catch (error) {
    console.error("[Question]:", error);
    return jsonResponse(null, {
      success: false,
      message: "Internal Server Error",
      status: 500,
    });
    
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const questionData: Question = body;
  try {
    if (
      !questionData.stream ||
      !questionData.slug ||
      !questionData.type ||
      !questionData.content ||
      !questionData.difficulty ||
      !questionData.subjectId ||
      !questionData.class ||
      !questionData.topicId
    ) {
      return jsonResponse(
        null,
        { success: false, message: "Missing required fields", status: 400 }
      )
    }

    
    // if (!session?.user?.id) {
    //   return new Response("Unauthorized", { status: 401 });
    // }


    const question = await prisma.question.create({
      data: {
        slug: questionData.slug, 
        title:questionData.title,
        content: questionData.content,
        type: questionData.type,
        format: questionData.format,
        difficulty: questionData.difficulty,
        class: questionData.class,
        stream: questionData.stream,
        subjectId: questionData.subjectId,
        topicId: questionData.topicId,
        subtopicId:questionData.subtopicId as string | undefined,
        category:{
          create: questionData.category.map((category: QCategory) => ({
            category: category,})),
          },
        
        pyqYear: questionData.pyqYear,
        book:questionData.book,
        hint: questionData.hint,
        solution: questionData.solution,
        commonMistake:questionData.commonMistake,
        questionTime: questionData.questionTime,
        isNumerical: questionData.isNumerical,
        isPublished:questionData.isPublished,
        createdBy: "session.user.id", //!session.user.id ? "default-user-id" : session.user.id,
        options: {
          create: questionData.options?.map((option) => ({
            content: option.content,
            isCorrect: option.isCorrect,
          })),
        },

        createdAt: new Date(),
      }  as Prisma.QuestionUncheckedCreateInput,
    });
    // console.log(question);

    if (!question) {
      return jsonResponse(null,{status:500,message:"Question not created",success:false})
    }
    return jsonResponse(null,{status:200,message:"Ok",success:true})
  } catch (err) {
    console.error(err);
    return jsonResponse(null, {success:false,message:"Internal Server Error",status:500})
  }
}