import {
  CurriculumSubject,
  CurriculumTopic,
  ExamCurriculum,
  ExamCurriculumSummary,
  SubjectSummary,
  TopicSearchParams,
  TopicSearchResult
} from "./types.js";
import { curricula } from "./curricula.js";

const normalize = (value: string) => value.trim().toLowerCase();

const subjectMatches = (subject: CurriculumSubject, needle: string) => {
  const target = normalize(needle);
  return subject.code.toLowerCase() === target || subject.slug === target;
};

const pickSubject = (exam: ExamCurriculum | undefined, subjectCode?: string) => {
  if (!exam) return undefined;
  if (!subjectCode) return undefined;
  return exam.subjects.find((subject) => subjectMatches(subject, subjectCode));
};

const flattenTopics = (exam: ExamCurriculum, subjectFilter?: string) => {
  const subjects = subjectFilter
    ? exam.subjects.filter((subject) => subjectMatches(subject, subjectFilter))
    : exam.subjects;

  return subjects.flatMap((subject) =>
    subject.units.flatMap((unit) =>
      unit.topics.map<TopicSearchResult>((topic) => ({
        examCode: exam.code,
        examName: exam.name,
        subjectCode: subject.code,
        subjectName: subject.name,
        unitName: unit.name,
        topic
      }))
    )
  );
};

export const getExamCurriculum = (examCode: string) => curricula[examCode];

export const listExamCurricula = (): ExamCurriculumSummary[] =>
  Object.values(curricula).map((exam) => ({
    id: exam.id,
    code: exam.code,
    name: exam.name,
    version: exam.version,
    subjects: exam.subjects.length,
    streams: exam.streams,
    totalMarks: exam.metadata.totalMarks,
    defaultDurationMinutes: exam.metadata.defaultDurationMinutes
  }));

export const listSubjectSummaries = (examCode: string): SubjectSummary[] => {
  const exam = getExamCurriculum(examCode);
  if (!exam) return [];

  return exam.subjects.map((subject) => ({
    code: subject.code,
    name: subject.name,
    units: subject.units.length,
    questions: subject.blueprint.questions,
    marks: subject.blueprint.marks
  }));
};

export const getSubject = (examCode: string, subjectCode: string) =>
  pickSubject(getExamCurriculum(examCode), subjectCode);

export const getSubjectTopics = (
  examCode: string,
  subjectCode: string
): CurriculumTopic[] => {
  const subject = getSubject(examCode, subjectCode);
  if (!subject) return [];
  return subject.units.flatMap((unit) => unit.topics);
};

const nonNullableExam = (exam: ExamCurriculum | undefined): exam is ExamCurriculum =>
  Boolean(exam);

export const searchTopics = (params: TopicSearchParams = {}): TopicSearchResult[] => {
  const { examCode, subjectCode, query, tags, difficulty, limit } = params;
  const exams = examCode
    ? [curricula[examCode]].filter(nonNullableExam)
    : Object.values(curricula);
  const normalizedQuery = query ? normalize(query) : undefined;
  const normalizedTags = tags?.map((tag) => normalize(tag));

  let results = exams.flatMap((exam) => flattenTopics(exam, subjectCode)).filter((result) => {
    const { topic } = result;

    if (normalizedQuery) {
      const haystack = `${topic.name} ${topic.description ?? ""} ${topic.tags.join(" ")}`.toLowerCase();
      if (!haystack.includes(normalizedQuery)) {
        return false;
      }
    }

    if (normalizedTags && normalizedTags.length > 0) {
      const topicTags = topic.tags.map((tag) => normalize(tag));
      const hasEveryTag = normalizedTags.every((tag) => topicTags.includes(tag));
      if (!hasEveryTag) return false;
    }

    if (difficulty && difficulty.length > 0) {
      if (!difficulty.includes(topic.difficulty)) return false;
    }

    return true;
  });

  if (limit && limit > 0) {
    results = results.slice(0, limit);
  }

  return results;
};

export const listExamCodes = () => Object.keys(curricula);

export const getTopicPath = (examCode: string, topicId: string) => {
  const exam = getExamCurriculum(examCode);
  if (!exam) return undefined;

  for (const subject of exam.subjects) {
    for (const unit of subject.units) {
      const topic = unit.topics.find((item) => item.id === topicId || item.slug === topicId);
      if (topic) {
        return {
          examCode: exam.code,
          examName: exam.name,
          subjectCode: subject.code,
          subjectName: subject.name,
          unitId: unit.id,
          unitName: unit.name,
          topic
        };
      }
    }
  }

  return undefined;
};

