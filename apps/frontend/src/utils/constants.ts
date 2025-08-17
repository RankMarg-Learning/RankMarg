import { StandardEnum } from "@repo/db/enums";
import { FlaskConical,  Ruler, Dna, Telescope, LucideIcon } from "lucide-react";

export type Stream = "JEE" | "NEET";


export interface SubjectData {
  id: string;
  name: string;
  stream: Stream;
  icon?: LucideIcon;
  description?: string;
}

export interface TopicData {
  id: string;
  name: string;
  subjectId: string;
  description?: string;
}

export const SUBJECTS: SubjectData[] = [
  {
    id: "jee-physics",
    name: "Physics",
    stream: "JEE",
    icon: Telescope,
    description: "Study of matter, energy, and the interaction between them",
  },
  {
    id: "jee-chemistry",
    name: "Chemistry",
    stream: "JEE",
    icon: FlaskConical,
    description: "Study of the composition, structure, and properties of matter",
  },
  {
    id: "jee-mathematics",
    name: "Mathematics",
    stream: "JEE",
    icon: Ruler,
    description: "Study of numbers, quantities, and shapes",
  },

  // NEET Subjects
  {
    id: "neet-physics",
    name: "Physics",
    stream: "NEET",
    icon: Telescope,
    description: "Study of matter, energy, and the interaction between them",
  },
  {
    id: "neet-chemistry",
    name: "Chemistry",
    stream: "NEET",
    icon: FlaskConical,
    description: "Study of the composition, structure, and properties of matter",
  },
  {
    id: "neet-biology",
    name: "Biology",
    stream: "NEET",
    icon: Dna,
    description: "Study of living organisms and their interactions",
  },
];

export const TOPICS: Record<string, TopicData[]> = {
  "jee-physics": [
    { id: "jee-physics-mechanics", name: "Mechanics", subjectId: "jee-physics", description: "Study of motion and forces" },
    { id: "jee-physics-thermodynamics", name: "Thermodynamics", subjectId: "jee-physics", description: "Study of heat and energy" },
    { id: "jee-physics-electromagnetism", name: "Electromagnetism", subjectId: "jee-physics", description: "Study of electricity and magnetism" },
    { id: "jee-physics-optics", name: "Optics", subjectId: "jee-physics", description: "Study of light and optical phenomena" },
    { id: "jee-physics-modern", name: "Modern Physics", subjectId: "jee-physics", description: "Study of quantum mechanics and relativity" },
    { id: "jee-physics-wave", name: "Wave Motion", subjectId: "jee-physics", description: "Study of waves and vibrations" }
  ],
  "jee-chemistry": [
    { id: "jee-chemistry-organic", name: "Organic Chemistry", subjectId: "jee-chemistry", description: "Study of carbon compounds" },
    { id: "jee-chemistry-inorganic", name: "Inorganic Chemistry", subjectId: "jee-chemistry", description: "Study of non-organic compounds" },
    { id: "jee-chemistry-physical", name: "Physical Chemistry", subjectId: "jee-chemistry", description: "Study of chemical systems" },
    { id: "jee-chemistry-equilibrium", name: "Chemical Equilibrium", subjectId: "jee-chemistry", description: "Study of balanced chemical reactions" },
    { id: "jee-chemistry-periodic", name: "Periodic Table", subjectId: "jee-chemistry", description: "Study of chemical elements and their properties" },
    { id: "jee-chemistry-reactions", name: "Chemical Reactions", subjectId: "jee-chemistry", description: "Study of chemical transformations" }
  ],
  "jee-mathematics": [
    { id: "jee-mathematics-algebra", name: "Algebra", subjectId: "jee-mathematics", description: "Study of mathematical symbols and rules" },
    { id: "jee-mathematics-calculus", name: "Calculus", subjectId: "jee-mathematics", description: "Study of rates of change" },
    { id: "jee-mathematics-geometry", name: "Geometry", subjectId: "jee-mathematics", description: "Study of shapes and spaces" },
    { id: "jee-mathematics-trigonometry", name: "Trigonometry", subjectId: "jee-mathematics", description: "Study of triangles and angles" },
    { id: "jee-mathematics-vectors", name: "Vectors", subjectId: "jee-mathematics", description: "Study of quantities with magnitude and direction" },
    { id: "jee-mathematics-probability", name: "Probability", subjectId: "jee-mathematics", description: "Study of randomness and uncertainty" }
  ],
  "neet-physics": [
    { id: "neet-physics-mechanics", name: "Mechanics", subjectId: "neet-physics", description: "Study of motion and forces" },
    { id: "neet-physics-optics", name: "Optics", subjectId: "neet-physics", description: "Study of light and vision" },
    { id: "neet-physics-modern", name: "Modern Physics", subjectId: "neet-physics", description: "Study of relativity and quantum mechanics" },
    { id: "neet-physics-thermal", name: "Thermal Physics", subjectId: "neet-physics", description: "Study of heat and temperature" },
    { id: "neet-physics-electrostatics", name: "Electrostatics", subjectId: "neet-physics", description: "Study of static electric charges" },
    { id: "neet-physics-magnetism", name: "Magnetism", subjectId: "neet-physics", description: "Study of magnetic fields and forces" }
  ],
  "neet-chemistry": [
    { id: "neet-chemistry-organic", name: "Organic Chemistry", subjectId: "neet-chemistry", description: "Study of carbon compounds" },
    { id: "neet-chemistry-inorganic", name: "Inorganic Chemistry", subjectId: "neet-chemistry", description: "Study of non-organic compounds" },
    { id: "neet-chemistry-physical", name: "Physical Chemistry", subjectId: "neet-chemistry", description: "Study of chemical systems" },
    { id: "neet-chemistry-biochem", name: "Biochemistry", subjectId: "neet-chemistry", description: "Study of chemical processes in living organisms" },
    { id: "neet-chemistry-solutions", name: "Solutions", subjectId: "neet-chemistry", description: "Study of homogeneous mixtures" },
    { id: "neet-chemistry-equilibrium", name: "Chemical Equilibrium", subjectId: "neet-chemistry", description: "Study of balanced chemical reactions" }
  ],
  "neet-biology": [
    { id: "neet-biology-botany", name: "Botany", subjectId: "neet-biology", description: "Study of plants" },
    { id: "neet-biology-zoology", name: "Zoology", subjectId: "neet-biology", description: "Study of animals" },
    { id: "neet-biology-human", name: "Human Physiology", subjectId: "neet-biology", description: "Study of human body functions" },
    { id: "neet-biology-genetics", name: "Genetics", subjectId: "neet-biology", description: "Study of genes and heredity" },
    { id: "neet-biology-ecology", name: "Ecology", subjectId: "neet-biology", description: "Study of organisms and their environment" },
    { id: "neet-biology-cell", name: "Cell Biology", subjectId: "neet-biology", description: "Study of cellular structure and function" }
  ]
};

export const getSubjectsByStream = (stream: Stream): SubjectData[] => {
  return SUBJECTS.filter(subject => subject.stream === stream);
};

export const getTopicsBySubject = (subjectId: string): TopicData[] => {
  return TOPICS[subjectId] || [];
};

export interface StreamData {
  id: Stream;
  name: string;
  description: string;
  subjects: SubjectData[];
}

export const STREAMS: StreamData[] = [
  {
    id: "JEE",
    name: "JEE",
    description: "Joint Entrance Examination for Engineering",
    subjects: SUBJECTS.filter(subject => subject.stream === "JEE")
  },
  {
    id: "NEET",
    name: "NEET",
    description: "National Eligibility cum Entrance Test for Medical",
    subjects: SUBJECTS.filter(subject => subject.stream === "NEET")
  }
];

export const GRADE_LEVELS: { value: StandardEnum; label: string; description: string }[] = [
  { value: StandardEnum.CLASS_11, label: "Class 11", description: "First year of higher secondary" },
  { value: StandardEnum.CLASS_12, label: "Class 12", description: "Final year of higher secondary" },
  { value: StandardEnum.CLASS_13, label: "Dropper", description: "Taking a year off after class 12 for exam preparation" }
];

export const getTargetYears = (): number[] => {
  const currentYear = new Date().getFullYear();
  return [currentYear, currentYear + 1, currentYear + 2];
};

export const STUDY_HOURS_OPTIONS = [
  { value: 2, label: "2 hours" },
  { value: 4, label: "4 hours" },
  { value: 6, label: "6 hours" },
  { value: 8, label: "8 hours" },
  { value: 10, label: "10+ hours" }
];