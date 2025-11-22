import { ExamCurriculum } from "./types.js";

export const curricula: Record<string, ExamCurriculum> = {
  JEE_MAIN: {
    id: "jee-main-v2025",
    code: "JEE_MAIN",
    name: "JEE Main",
    version: "2025.01",
    board: "NTA",
    streams: ["PCM"],
    targetGrades: ["Class 11", "Class 12", "Dropper"],
    description:
      "Three-paper national-level engineering entrance exam with equal weightage for Physics, Chemistry and Mathematics.",
    metadata: {
      attemptsPerYear: 2,
      defaultDurationMinutes: 180,
      totalMarks: 300,
      markingScheme: "+4 for correct, -1 for incorrect in Section A; +4 / 0 in Section B.",
      release: "2024-10-01"
    },
    sections: [
      { id: "jee-math", name: "Mathematics", questions: 30, marks: 100, negativeMarking: "-1" },
      { id: "jee-phy", name: "Physics", questions: 30, marks: 100, negativeMarking: "-1" },
      { id: "jee-chem", name: "Chemistry", questions: 30, marks: 100, negativeMarking: "-1" }
    ],
    subjects: [
      {
        id: "jee-math",
        code: "MATH",
        name: "Mathematics",
        slug: "mathematics",
        competencies: ["Problem solving", "Mathematical modelling", "Application of formulae"],
        blueprint: {
          marks: 100,
          questions: 30,
          durationMinutes: 60,
          difficultySplit: { foundation: 30, moderate: 45, advanced: 25 },
          weightageByUnit: {
            algebra: 35,
            calculus: 35,
            coordinate: 30
          }
        },
        units: [
          {
            id: "jee-math-algebra",
            name: "Algebra & Number Theory",
            slug: "algebra",
            focus: "Sequences, series, polynomials and complex-number manipulations.",
            topics: [
              {
                id: "jee-math-binomial",
                name: "Binomial Theorem",
                slug: "binomial-theorem",
                description: "General term, middle terms and approximations using binomial expansion.",
                difficulty: "advanced",
                tags: ["algebra", "series"],
                prerequisites: ["jee-math-sequence"],
                recommendedHours: 6,
                weightagePercent: 6,
                competencies: ["Series expansion", "Approximation"],
                blueprintNotes: "Frequently paired with probability / series MCQs."
              },
              {
                id: "jee-math-complex",
                name: "Complex Numbers",
                slug: "complex-numbers",
                description: "Argand plane, De Moivre's theorem and geometric interpretations.",
                difficulty: "moderate",
                tags: ["geometry", "algebra"],
                prerequisites: ["jee-math-trigonometry"],
                recommendedHours: 5,
                weightagePercent: 7,
                competencies: ["Vector interpretation", "Equation solving"],
                blueprintNotes: "High-frequency topic in Section A.",
                resources: [
                  { type: "notes", title: "NTA formula sheet" },
                  { type: "pyq", title: "JEE Main PYQs 2019-2024" }
                ]
              },
              {
                id: "jee-math-sequence",
                name: "Sequences & Series",
                slug: "sequences-and-series",
                description: "AP/GP/HP, special series and telescoping sums.",
                difficulty: "foundation",
                tags: ["algebra"],
                prerequisites: [],
                recommendedHours: 4,
                weightagePercent: 5,
                competencies: ["Summation", "Pattern recognition"]
              }
            ]
          },
          {
            id: "jee-math-calculus",
            name: "Calculus & Differential Equations",
            slug: "calculus",
            focus: "Limits, differentiation, integration and basic differential equations.",
            topics: [
              {
                id: "jee-math-limits",
                name: "Limits & Continuity",
                slug: "limits-and-continuity",
                description: "Algebraic, trigonometric and exponential limits; L'Hospital rule.",
                difficulty: "moderate",
                tags: ["calculus"],
                prerequisites: ["jee-math-sequence"],
                recommendedHours: 5,
                weightagePercent: 8,
                competencies: ["Analytical reasoning", "Series manipulation"]
              },
              {
                id: "jee-math-integral",
                name: "Definite & Indefinite Integrals",
                slug: "definite-integrals",
                description: "Standard forms, substitution, parts and properties of definite integrals.",
                difficulty: "advanced",
                tags: ["calculus"],
                prerequisites: ["jee-math-limits"],
                recommendedHours: 8,
                weightagePercent: 9,
                competencies: ["Area computation", "Transformations"],
                blueprintNotes: "Expect one Section B numerical from this block."
              },
              {
                id: "jee-math-diffeq",
                name: "First-Order Differential Equations",
                slug: "differential-equations",
                description: "Variable separable, linear and homogeneous forms.",
                difficulty: "foundation",
                tags: ["calculus"],
                prerequisites: ["jee-math-integral"],
                recommendedHours: 3,
                weightagePercent: 4,
                competencies: ["Modelling", "Rate of change"]
              }
            ]
          },
          {
            id: "jee-math-coordinate",
            name: "Coordinate Geometry & Vectors",
            slug: "coordinate-geometry",
            focus: "Analytical geometry combined with vector applications.",
            topics: [
              {
                id: "jee-math-conics",
                name: "Conic Sections",
                slug: "conic-sections",
                difficulty: "moderate",
                description: "Parabola, ellipse and hyperbola along with standard transformations.",
                tags: ["geometry"],
                prerequisites: [],
                recommendedHours: 6,
                weightagePercent: 6,
                competencies: ["Graphing", "Equation transformation"]
              },
              {
                id: "jee-math-3d",
                name: "3D Geometry",
                slug: "3d-geometry",
                difficulty: "advanced",
                description: "Lines, planes and distance calculations in 3D space.",
                tags: ["geometry", "vectors"],
                prerequisites: ["jee-math-vectors"],
                recommendedHours: 5,
                weightagePercent: 4,
                competencies: ["Spatial reasoning", "Cross product"]
              },
              {
                id: "jee-math-vectors",
                name: "Vectors",
                slug: "vectors",
                difficulty: "foundation",
                description: "Dot/cross product, scalar triple product and projections.",
                tags: ["vectors"],
                prerequisites: [],
                recommendedHours: 4,
                weightagePercent: 5,
                competencies: ["Vector algebra", "Projection"]
              }
            ]
          }
        ]
      },
      {
        id: "jee-physics",
        code: "PHYSICS",
        name: "Physics",
        slug: "physics",
        competencies: ["Conceptual clarity", "Multi-step derivations"],
        blueprint: {
          marks: 100,
          questions: 30,
          durationMinutes: 60,
          difficultySplit: { foundation: 35, moderate: 40, advanced: 25 },
          weightageByUnit: {
            mechanics: 40,
            electromagnetism: 35,
            modern: 25
          }
        },
        units: [
          {
            id: "jee-phy-mechanics",
            name: "Mechanics & Waves",
            slug: "mechanics",
            focus: "Kinematics, dynamics and oscillations.",
            topics: [
              {
                id: "jee-phy-kinematics",
                name: "Kinematics",
                slug: "kinematics",
                difficulty: "foundation",
                tags: ["mechanics"],
                prerequisites: [],
                recommendedHours: 4,
                weightagePercent: 5,
                competencies: ["Vector resolution", "Graph interpretation"]
              },
              {
                id: "jee-phy-newton",
                name: "Newton's Laws & Friction",
                slug: "newtons-laws",
                difficulty: "moderate",
                tags: ["mechanics"],
                prerequisites: ["jee-phy-kinematics"],
                recommendedHours: 6,
                weightagePercent: 7,
                competencies: ["Free-body diagrams", "Constraint equations"]
              },
              {
                id: "jee-phy-shm",
                name: "Simple Harmonic Motion & Waves",
                slug: "shm-waves",
                difficulty: "advanced",
                tags: ["waves", "mechanics"],
                prerequisites: ["jee-phy-newton"],
                recommendedHours: 5,
                weightagePercent: 6,
                competencies: ["Energy analysis", "Differential modelling"]
              }
            ]
          },
          {
            id: "jee-phy-electro",
            name: "Electrodynamics",
            slug: "electromagnetism",
            focus: "Electrostatics, current electricity and magnetism.",
            topics: [
              {
                id: "jee-phy-electrostatics",
                name: "Electrostatics",
                slug: "electrostatics",
                difficulty: "moderate",
                tags: ["electricity"],
                prerequisites: [],
                recommendedHours: 5,
                weightagePercent: 8,
                competencies: ["Field mapping", "Gauss law"]
              },
              {
                id: "jee-phy-current",
                name: "Current Electricity",
                slug: "current-electricity",
                difficulty: "foundation",
                tags: ["electricity"],
                prerequisites: ["jee-phy-electrostatics"],
                recommendedHours: 4,
                weightagePercent: 7,
                competencies: ["Circuit reduction", "Network theorems"]
              },
              {
                id: "jee-phy-magnetism",
                name: "Magnetism & EMI",
                slug: "magnetism",
                difficulty: "advanced",
                tags: ["magnetism"],
                prerequisites: ["jee-phy-current"],
                recommendedHours: 6,
                weightagePercent: 6,
                competencies: ["Right-hand rule", "Flux calculation"]
              }
            ]
          },
          {
            id: "jee-phy-modern",
            name: "Modern Physics & Optics",
            slug: "modern-physics",
            focus: "Dual nature, atomic models and wave optics.",
            topics: [
              {
                id: "jee-phy-photoelectric",
                name: "Photoelectric Effect",
                slug: "photoelectric-effect",
                difficulty: "foundation",
                tags: ["modern"],
                prerequisites: [],
                recommendedHours: 3,
                weightagePercent: 4,
                competencies: ["Energy quantization"]
              },
              {
                id: "jee-phy-atomic",
                name: "Atomic & Nuclear Physics",
                slug: "atomic-nuclear",
                difficulty: "moderate",
                tags: ["modern"],
                prerequisites: ["jee-phy-photoelectric"],
                recommendedHours: 4,
                weightagePercent: 5,
                competencies: ["Series formulae"]
              },
              {
                id: "jee-phy-optics",
                name: "Wave & Ray Optics",
                slug: "optics",
                difficulty: "advanced",
                tags: ["optics"],
                prerequisites: ["jee-phy-shm"],
                recommendedHours: 5,
                weightagePercent: 6,
                competencies: ["Interference", "Diffraction"]
              }
            ]
          }
        ]
      },
      {
        id: "jee-chem",
        code: "CHEM",
        name: "Chemistry",
        slug: "chemistry",
        competencies: ["Concept integration", "Reaction mechanism mapping"],
        blueprint: {
          marks: 100,
          questions: 30,
          durationMinutes: 60,
          difficultySplit: { foundation: 45, moderate: 35, advanced: 20 },
          weightageByUnit: {
            physical: 35,
            organic: 35,
            inorganic: 30
          }
        },
        units: [
          {
            id: "jee-chem-physical",
            name: "Physical Chemistry",
            slug: "physical-chemistry",
            focus: "Atomic structure, thermodynamics and kinetics.",
            topics: [
              {
                id: "jee-chem-thermo",
                name: "Chemical Thermodynamics",
                slug: "chemical-thermodynamics",
                difficulty: "moderate",
                tags: ["thermodynamics"],
                prerequisites: [],
                recommendedHours: 5,
                weightagePercent: 7,
                competencies: ["Gibbs free energy", "Enthalpy calculations"]
              },
              {
                id: "jee-chem-kinetics",
                name: "Chemical Kinetics",
                slug: "chemical-kinetics",
                difficulty: "advanced",
                tags: ["kinetics"],
                prerequisites: ["jee-chem-thermo"],
                recommendedHours: 6,
                weightagePercent: 6,
                competencies: ["Rate law derivation"]
              },
              {
                id: "jee-chem-equilibrium",
                name: "Ionic Equilibrium",
                slug: "ionic-equilibrium",
                difficulty: "foundation",
                tags: ["equilibrium"],
                prerequisites: [],
                recommendedHours: 4,
                weightagePercent: 5,
                competencies: ["pH calculations"]
              }
            ]
          },
          {
            id: "jee-chem-organic",
            name: "Organic Chemistry",
            slug: "organic-chemistry",
            focus: "Mechanisms, named reactions and biomolecules.",
            topics: [
              {
                id: "jee-chem-hydrocarbon",
                name: "Hydrocarbons",
                slug: "hydrocarbons",
                difficulty: "foundation",
                tags: ["organic"],
                prerequisites: [],
                recommendedHours: 4,
                weightagePercent: 6,
                competencies: ["Reaction prediction"]
              },
              {
                id: "jee-chem-alcohols",
                name: "Alcohols, Phenols & Ethers",
                slug: "alcohols-phenols-ethers",
                difficulty: "moderate",
                tags: ["organic"],
                prerequisites: ["jee-chem-hydrocarbon"],
                recommendedHours: 5,
                weightagePercent: 6,
                competencies: ["Mechanism mapping"]
              },
              {
                id: "jee-chem-biomolecules",
                name: "Biomolecules",
                slug: "biomolecules",
                difficulty: "advanced",
                tags: ["organic", "biology"],
                prerequisites: ["jee-chem-alcohols"],
                recommendedHours: 4,
                weightagePercent: 4,
                competencies: ["Structure identification"]
              }
            ]
          },
          {
            id: "jee-chem-inorganic",
            name: "Inorganic Chemistry",
            slug: "inorganic-chemistry",
            focus: "Periodic properties, coordination compounds and metallurgy.",
            topics: [
              {
                id: "jee-chem-coordination",
                name: "Coordination Compounds",
                slug: "coordination-compounds",
                difficulty: "moderate",
                tags: ["inorganic"],
                prerequisites: [],
                recommendedHours: 5,
                weightagePercent: 7,
                competencies: ["Crystal field theory"]
              },
              {
                id: "jee-chem-pblock",
                name: "p-Block Elements",
                slug: "p-block-elements",
                difficulty: "foundation",
                tags: ["inorganic"],
                prerequisites: [],
                recommendedHours: 4,
                weightagePercent: 5,
                competencies: ["Memory recall"]
              },
              {
                id: "jee-chem-metallurgy",
                name: "General Principles of Metallurgy",
                slug: "metallurgy",
                difficulty: "foundation",
                tags: ["inorganic"],
                prerequisites: [],
                recommendedHours: 3,
                weightagePercent: 4,
                competencies: ["Process mapping"]
              }
            ]
          }
        ]
      }
    ]
  },
  NEET_UG: {
    id: "neet-ug-v2025",
    code: "NEET_UG",
    name: "NEET UG",
    version: "2025.01",
    board: "NTA",
    streams: ["PCB"],
    targetGrades: ["Class 11", "Class 12", "Dropper"],
    description: "Single-paper medical entrance exam focusing on Biology, Physics and Chemistry.",
    metadata: {
      attemptsPerYear: 1,
      defaultDurationMinutes: 200,
      totalMarks: 720,
      markingScheme: "+4 for correct and -1 for incorrect.",
      release: "2024-10-01"
    },
    sections: [
      { id: "neet-bio", name: "Biology", questions: 100, marks: 400, negativeMarking: "-1" },
      { id: "neet-chem", name: "Chemistry", questions: 50, marks: 200, negativeMarking: "-1" },
      { id: "neet-phy", name: "Physics", questions: 50, marks: 200, negativeMarking: "-1" }
    ],
    subjects: [
      {
        id: "neet-bio",
        code: "BIO",
        name: "Biology",
        slug: "biology",
        competencies: ["Diagram interpretation", "NCERT recall"],
        blueprint: {
          marks: 400,
          questions: 100,
          durationMinutes: 110,
          difficultySplit: { foundation: 55, moderate: 35, advanced: 10 },
          weightageByUnit: {
            botany: 45,
            zoology: 55
          }
        },
        units: [
          {
            id: "neet-bio-botany",
            name: "Botany",
            slug: "botany",
            focus: "Plant diversity, anatomy and physiology.",
            topics: [
              {
                id: "neet-bio-diversity",
                name: "Plant Diversity",
                slug: "plant-diversity",
                difficulty: "foundation",
                tags: ["botany"],
                prerequisites: [],
                recommendedHours: 4,
                weightagePercent: 8,
                competencies: ["Classification"]
              },
              {
                id: "neet-bio-anatomy",
                name: "Plant Anatomy & Morphology",
                slug: "plant-anatomy",
                difficulty: "moderate",
                tags: ["botany"],
                prerequisites: ["neet-bio-diversity"],
                recommendedHours: 5,
                weightagePercent: 6,
                competencies: ["Diagram labelling"]
              },
              {
                id: "neet-bio-photosynthesis",
                name: "Photosynthesis & Respiration",
                slug: "photosynthesis",
                difficulty: "advanced",
                tags: ["botany", "physiology"],
                prerequisites: ["neet-bio-anatomy"],
                recommendedHours: 6,
                weightagePercent: 6,
                competencies: ["Pathway mapping"]
              }
            ]
          },
          {
            id: "neet-bio-zoology",
            name: "Zoology & Human Physiology",
            slug: "zoology",
            focus: "Human anatomy, reproduction and health.",
            topics: [
              {
                id: "neet-bio-digestion",
                name: "Digestion & Absorption",
                slug: "digestion",
                difficulty: "foundation",
                tags: ["physiology"],
                prerequisites: [],
                recommendedHours: 4,
                weightagePercent: 6,
                competencies: ["Flowchart creation"]
              },
              {
                id: "neet-bio-reproduction",
                name: "Human Reproduction",
                slug: "human-reproduction",
                difficulty: "moderate",
                tags: ["reproduction"],
                prerequisites: ["neet-bio-digestion"],
                recommendedHours: 5,
                weightagePercent: 7,
                competencies: ["NCERT recall"]
              },
              {
                id: "neet-bio-genetics",
                name: "Genetics & Evolution",
                slug: "genetics",
                difficulty: "advanced",
                tags: ["genetics"],
                prerequisites: [],
                recommendedHours: 7,
                weightagePercent: 9,
                competencies: ["Pedigree analysis"]
              }
            ]
          }
        ]
      },
      {
        id: "neet-chem",
        code: "CHEM",
        name: "Chemistry",
        slug: "chemistry",
        competencies: ["NCERT specifics", "Application of formulae"],
        blueprint: {
          marks: 200,
          questions: 50,
          durationMinutes: 45,
          difficultySplit: { foundation: 50, moderate: 35, advanced: 15 },
          weightageByUnit: {
            physical: 30,
            organic: 40,
            inorganic: 30
          }
        },
        units: [
          {
            id: "neet-chem-physical",
            name: "Physical Chemistry",
            slug: "physical-chemistry",
            focus: "Solutions, electrochemistry and surface chemistry.",
            topics: [
              {
                id: "neet-chem-solution",
                name: "Solutions & Colligative Properties",
                slug: "solutions",
                difficulty: "foundation",
                tags: ["physical"],
                prerequisites: [],
                recommendedHours: 4,
                weightagePercent: 6,
                competencies: ["Numerical accuracy"]
              },
              {
                id: "neet-chem-electrochem",
                name: "Electrochemistry",
                slug: "electrochemistry",
                difficulty: "moderate",
                tags: ["electrochemistry"],
                prerequisites: ["neet-chem-solution"],
                recommendedHours: 5,
                weightagePercent: 6,
                competencies: ["Nernst equation"]
              },
              {
                id: "neet-chem-surface",
                name: "Surface Chemistry",
                slug: "surface-chemistry",
                difficulty: "foundation",
                tags: ["chemistry"],
                prerequisites: [],
                recommendedHours: 3,
                weightagePercent: 4,
                competencies: ["NCERT recall"]
              }
            ]
          },
          {
            id: "neet-chem-organic",
            name: "Organic Chemistry",
            slug: "organic-chemistry",
            focus: "Biomolecules, polymers and everyday chemistry.",
            topics: [
              {
                id: "neet-chem-amino",
                name: "Amines & Diazonium Salts",
                slug: "amines",
                difficulty: "moderate",
                tags: ["organic"],
                prerequisites: [],
                recommendedHours: 4,
                weightagePercent: 6,
                competencies: ["Mechanism recall"]
              },
              {
                id: "neet-chem-polymers",
                name: "Polymers",
                slug: "polymers",
                difficulty: "foundation",
                tags: ["organic"],
                prerequisites: [],
                recommendedHours: 3,
                weightagePercent: 4,
                competencies: ["Memory based"]
              },
              {
                id: "neet-chem-biomolecules",
                name: "Biomolecules",
                slug: "biomolecules",
                difficulty: "foundation",
                tags: ["organic"],
                prerequisites: [],
                recommendedHours: 3,
                weightagePercent: 4,
                competencies: ["Application"]
              }
            ]
          },
          {
            id: "neet-chem-inorganic",
            name: "Inorganic Chemistry",
            slug: "inorganic-chemistry",
            focus: "Coordination compounds and environmental chemistry.",
            topics: [
              {
                id: "neet-chem-coordination",
                name: "Coordination Compounds",
                slug: "coordination-compounds",
                difficulty: "moderate",
                tags: ["inorganic"],
                prerequisites: [],
                recommendedHours: 5,
                weightagePercent: 6,
                competencies: ["Hybridization prediction"]
              },
              {
                id: "neet-chem-dblock",
                name: "d & f Block Elements",
                slug: "d-f-block",
                difficulty: "foundation",
                tags: ["inorganic"],
                prerequisites: [],
                recommendedHours: 4,
                weightagePercent: 5,
                competencies: ["Property mapping"]
              },
              {
                id: "neet-chem-env",
                name: "Environmental Chemistry",
                slug: "environmental-chemistry",
                difficulty: "foundation",
                tags: ["inorganic"],
                prerequisites: [],
                recommendedHours: 2,
                weightagePercent: 3,
                competencies: ["Fact recall"]
              }
            ]
          }
        ]
      },
      {
        id: "neet-phy",
        code: "PHYSICS",
        name: "Physics",
        slug: "physics",
        competencies: ["Conceptual clarity", "Numerical ability"],
        blueprint: {
          marks: 200,
          questions: 50,
          durationMinutes: 45,
          difficultySplit: { foundation: 45, moderate: 40, advanced: 15 },
          weightageByUnit: {
            mechanics: 35,
            electricity: 35,
            modern: 30
          }
        },
        units: [
          {
            id: "neet-phy-mechanics",
            name: "Mechanics",
            slug: "mechanics",
            focus: "Motion, laws and gravitation.",
            topics: [
              {
                id: "neet-phy-motion",
                name: "Motion in a Straight Line",
                slug: "motion",
                difficulty: "foundation",
                tags: ["mechanics"],
                prerequisites: [],
                recommendedHours: 3,
                weightagePercent: 5,
                competencies: ["Graph reading"]
              },
              {
                id: "neet-phy-work",
                name: "Work, Power & Energy",
                slug: "work-power-energy",
                difficulty: "moderate",
                tags: ["mechanics"],
                prerequisites: ["neet-phy-motion"],
                recommendedHours: 4,
                weightagePercent: 6,
                competencies: ["Numerical"]
              },
              {
                id: "neet-phy-gravitation",
                name: "Gravitation",
                slug: "gravitation",
                difficulty: "foundation",
                tags: ["mechanics"],
                prerequisites: [],
                recommendedHours: 3,
                weightagePercent: 5,
                competencies: ["Formula application"]
              }
            ]
          },
          {
            id: "neet-phy-electricity",
            name: "Electricity & Magnetism",
            slug: "electricity",
            focus: "Electrostatics, current electricity and magnetism.",
            topics: [
              {
                id: "neet-phy-electric",
                name: "Electrostatics",
                slug: "electrostatics",
                difficulty: "foundation",
                tags: ["electricity"],
                prerequisites: [],
                recommendedHours: 4,
                weightagePercent: 6,
                competencies: ["Conceptual"]
              },
              {
                id: "neet-phy-current",
                name: "Current Electricity",
                slug: "current-electricity",
                difficulty: "moderate",
                tags: ["electricity"],
                prerequisites: ["neet-phy-electric"],
                recommendedHours: 4,
                weightagePercent: 6,
                competencies: ["Circuit solving"]
              },
              {
                id: "neet-phy-magnetism",
                name: "Magnetism & EMI",
                slug: "magnetism",
                difficulty: "advanced",
                tags: ["magnetism"],
                prerequisites: ["neet-phy-current"],
                recommendedHours: 5,
                weightagePercent: 5,
                competencies: ["Flux analysis"]
              }
            ]
          },
          {
            id: "neet-phy-modern",
            name: "Modern Physics & Optics",
            slug: "modern-physics",
            focus: "Nuclear physics, dual nature and optics.",
            topics: [
              {
                id: "neet-phy-ray",
                name: "Ray Optics",
                slug: "ray-optics",
                difficulty: "foundation",
                tags: ["optics"],
                prerequisites: [],
                recommendedHours: 3,
                weightagePercent: 4,
                competencies: ["Diagram drawing"]
              },
              {
                id: "neet-phy-wave",
                name: "Wave Optics",
                slug: "wave-optics",
                difficulty: "moderate",
                tags: ["optics"],
                prerequisites: ["neet-phy-ray"],
                recommendedHours: 4,
                weightagePercent: 4,
                competencies: ["Interference"]
              },
              {
                id: "neet-phy-nuclear",
                name: "Nuclear Physics",
                slug: "nuclear-physics",
                difficulty: "advanced",
                tags: ["modern"],
                prerequisites: [],
                recommendedHours: 4,
                weightagePercent: 4,
                competencies: ["Radioactivity calculations"]
              }
            ]
          }
        ]
      }
    ]
  },
  CUET_SCI: {
    id: "cuet-sci-v2025",
    code: "CUET_SCI",
    name: "CUET Science Stream",
    version: "2025.01",
    board: "NTA",
    streams: ["Science"],
    targetGrades: ["Class 12"],
    description: "Domain-specific CUET curriculum focused on Physics, Biology and General Test.",
    metadata: {
      attemptsPerYear: 1,
      defaultDurationMinutes: 120,
      totalMarks: 400,
      markingScheme: "+5 for correct, -1 for incorrect, 0 otherwise.",
      release: "2024-10-01"
    },
    sections: [
      { id: "cuet-phy", name: "Physics", questions: 40, marks: 200, negativeMarking: "-1" },
      { id: "cuet-bio", name: "Biology", questions: 35, marks: 175, negativeMarking: "-1" },
      { id: "cuet-gt", name: "General Test", questions: 15, marks: 75, negativeMarking: "-1" }
    ],
    subjects: [
      {
        id: "cuet-phy",
        code: "PHYSICS",
        name: "Physics",
        slug: "physics",
        competencies: ["NCERT alignment", "Quick computation"],
        blueprint: {
          marks: 200,
          questions: 40,
          difficultySplit: { foundation: 50, moderate: 35, advanced: 15 },
          weightageByUnit: {
            mechanics: 30,
            electricity: 35,
            modern: 35
          }
        },
        units: [
          {
            id: "cuet-phy-mechanics",
            name: "Mechanics & Waves",
            slug: "mechanics",
            focus: "NCERT-aligned block with emphasis on vectors and SHM.",
            topics: [
              {
                id: "cuet-phy-motion",
                name: "Motion in Plane",
                slug: "motion-plane",
                difficulty: "foundation",
                tags: ["mechanics"],
                prerequisites: [],
                recommendedHours: 3,
                weightagePercent: 5,
                competencies: ["Component resolution"]
              },
              {
                id: "cuet-phy-shm",
                name: "Oscillations",
                slug: "oscillations",
                difficulty: "moderate",
                tags: ["waves"],
                prerequisites: ["cuet-phy-motion"],
                recommendedHours: 4,
                weightagePercent: 5,
                competencies: ["Energy graph"]
              },
              {
                id: "cuet-phy-wave",
                name: "Sound Waves",
                slug: "sound-waves",
                difficulty: "foundation",
                tags: ["waves"],
                prerequisites: [],
                recommendedHours: 3,
                weightagePercent: 4,
                competencies: ["Formula recall"]
              }
            ]
          },
          {
            id: "cuet-phy-electricity",
            name: "Electricity & Magnetism",
            slug: "electricity",
            focus: "Electrostatics, current and magnetism with low calculus dependency.",
            topics: [
              {
                id: "cuet-phy-electric",
                name: "Electric Charges & Fields",
                slug: "electric-charges",
                difficulty: "foundation",
                tags: ["electricity"],
                prerequisites: [],
                recommendedHours: 3,
                weightagePercent: 6,
                competencies: ["Conceptual clarity"]
              },
              {
                id: "cuet-phy-current",
                name: "Current Electricity",
                slug: "current-electricity",
                difficulty: "moderate",
                tags: ["electricity"],
                prerequisites: ["cuet-phy-electric"],
                recommendedHours: 4,
                weightagePercent: 6,
                competencies: ["Circuit solving"]
              },
              {
                id: "cuet-phy-magnetism",
                name: "Moving Charges & Magnetism",
                slug: "moving-charges",
                difficulty: "advanced",
                tags: ["magnetism"],
                prerequisites: ["cuet-phy-current"],
                recommendedHours: 4,
                weightagePercent: 5,
                competencies: ["Right-hand rule"]
              }
            ]
          },
          {
            id: "cuet-phy-modern",
            name: "Modern Physics",
            slug: "modern-physics",
            focus: "Semiconductors, communication systems and dual nature.",
            topics: [
              {
                id: "cuet-phy-semi",
                name: "Semiconductors & Logic Gates",
                slug: "semiconductors",
                difficulty: "foundation",
                tags: ["electronics"],
                prerequisites: [],
                recommendedHours: 3,
                weightagePercent: 6,
                competencies: ["Truth tables"]
              },
              {
                id: "cuet-phy-communication",
                name: "Communication Systems",
                slug: "communication-systems",
                difficulty: "foundation",
                tags: ["electronics"],
                prerequisites: [],
                recommendedHours: 2,
                weightagePercent: 4,
                competencies: ["Block diagrams"]
              },
              {
                id: "cuet-phy-dual",
                name: "Dual Nature of Radiation",
                slug: "dual-nature",
                difficulty: "moderate",
                tags: ["modern"],
                prerequisites: [],
                recommendedHours: 3,
                weightagePercent: 5,
                competencies: ["Work function"]
              }
            ]
          }
        ]
      },
      {
        id: "cuet-bio",
        code: "BIO",
        name: "Biology",
        slug: "biology",
        competencies: ["NCERT line-by-line", "Data interpretation"],
        blueprint: {
          marks: 175,
          questions: 35,
          difficultySplit: { foundation: 60, moderate: 30, advanced: 10 },
          weightageByUnit: {
            reproduction: 30,
            genetics: 40,
            ecology: 30
          }
        },
        units: [
          {
            id: "cuet-bio-reproduction",
            name: "Reproduction",
            slug: "reproduction",
            focus: "Plant and human reproduction chapters from NCERT.",
            topics: [
              {
                id: "cuet-bio-flowering",
                name: "Reproduction in Flowering Plants",
                slug: "reproduction-flowering",
                difficulty: "foundation",
                tags: ["botany"],
                prerequisites: [],
                recommendedHours: 3,
                weightagePercent: 6,
                competencies: ["Diagram labelling"]
              },
              {
                id: "cuet-bio-humans",
                name: "Human Reproduction",
                slug: "human-reproduction",
                difficulty: "moderate",
                tags: ["zoology"],
                prerequisites: ["cuet-bio-flowering"],
                recommendedHours: 4,
                weightagePercent: 6,
                competencies: ["Hormonal control"]
              },
              {
                id: "cuet-bio-health",
                name: "Reproductive Health",
                slug: "reproductive-health",
                difficulty: "foundation",
                tags: ["zoology"],
                prerequisites: [],
                recommendedHours: 2,
                weightagePercent: 4,
                competencies: ["Policy recall"]
              }
            ]
          },
          {
            id: "cuet-bio-genetics",
            name: "Genetics & Biotechnology",
            slug: "genetics",
            focus: "Inheritance, molecular basis and biotech applications.",
            topics: [
              {
                id: "cuet-bio-mendel",
                name: "Mendelian Genetics",
                slug: "mendelian-genetics",
                difficulty: "foundation",
                tags: ["genetics"],
                prerequisites: [],
                recommendedHours: 3,
                weightagePercent: 7,
                competencies: ["Punnett square"]
              },
              {
                id: "cuet-bio-dna",
                name: "Molecular Basis of Inheritance",
                slug: "molecular-inheritance",
                difficulty: "moderate",
                tags: ["genetics"],
                prerequisites: ["cuet-bio-mendel"],
                recommendedHours: 4,
                weightagePercent: 7,
                competencies: ["Central dogma"]
              },
              {
                id: "cuet-bio-biotech",
                name: "Biotechnology & Applications",
                slug: "biotechnology",
                difficulty: "foundation",
                tags: ["biotech"],
                prerequisites: [],
                recommendedHours: 3,
                weightagePercent: 5,
                competencies: ["Application"]
              }
            ]
          },
          {
            id: "cuet-bio-ecology",
            name: "Ecology & Environment",
            slug: "ecology",
            focus: "Ecosystems, biodiversity and environmental issues.",
            topics: [
              {
                id: "cuet-bio-ecosystem",
                name: "Ecosystem",
                slug: "ecosystem",
                difficulty: "foundation",
                tags: ["ecology"],
                prerequisites: [],
                recommendedHours: 2,
                weightagePercent: 4,
                competencies: ["Energy flow"]
              },
              {
                id: "cuet-bio-biodiversity",
                name: "Biodiversity & Conservation",
                slug: "biodiversity",
                difficulty: "foundation",
                tags: ["ecology"],
                prerequisites: [],
                recommendedHours: 2,
                weightagePercent: 4,
                competencies: ["Case studies"]
              },
              {
                id: "cuet-bio-environment",
                name: "Environmental Issues",
                slug: "environmental-issues",
                difficulty: "foundation",
                tags: ["ecology"],
                prerequisites: [],
                recommendedHours: 2,
                weightagePercent: 3,
                competencies: ["Policy awareness"]
              }
            ]
          }
        ]
      },
      {
        id: "cuet-gt",
        code: "GT",
        name: "General Test",
        slug: "general-test",
        competencies: ["Quantitative aptitude", "Logical reasoning", "Current affairs"],
        blueprint: {
          marks: 75,
          questions: 15,
          difficultySplit: { foundation: 70, moderate: 25, advanced: 5 },
          weightageByUnit: {
            aptitude: 40,
            reasoning: 35,
            awareness: 25
          }
        },
        units: [
          {
            id: "cuet-gt-aptitude",
            name: "Quantitative Aptitude",
            slug: "quant-aptitude",
            focus: "Arithmetic, algebra and basic geometry for CUET.",
            topics: [
              {
                id: "cuet-gt-percentage",
                name: "Percentage & Ratio",
                slug: "percentage-ratio",
                difficulty: "foundation",
                tags: ["aptitude"],
                prerequisites: [],
                recommendedHours: 2,
                weightagePercent: 5,
                competencies: ["Mental math"]
              },
              {
                id: "cuet-gt-ti",
                name: "Time, Speed & Distance",
                slug: "time-speed-distance",
                difficulty: "moderate",
                tags: ["aptitude"],
                prerequisites: ["cuet-gt-percentage"],
                recommendedHours: 3,
                weightagePercent: 4,
                competencies: ["Equation setup"]
              }
            ]
          },
          {
            id: "cuet-gt-reasoning",
            name: "Logical Reasoning",
            slug: "logical-reasoning",
            focus: "Series, puzzles and analytical reasoning.",
            topics: [
              {
                id: "cuet-gt-series",
                name: "Number & Letter Series",
                slug: "series",
                difficulty: "foundation",
                tags: ["reasoning"],
                prerequisites: [],
                recommendedHours: 2,
                weightagePercent: 4,
                competencies: ["Pattern spotting"]
              },
              {
                id: "cuet-gt-arrangement",
                name: "Seating Arrangement",
                slug: "seating-arrangement",
                difficulty: "moderate",
                tags: ["reasoning"],
                prerequisites: [],
                recommendedHours: 3,
                weightagePercent: 4,
                competencies: ["Visualization"]
              }
            ]
          },
          {
            id: "cuet-gt-awareness",
            name: "Current Affairs & GK",
            slug: "current-affairs",
            focus: "Static GK blended with last 12-month current affairs.",
            topics: [
              {
                id: "cuet-gt-polity",
                name: "Indian Polity Basics",
                slug: "indian-polity",
                difficulty: "foundation",
                tags: ["gk"],
                prerequisites: [],
                recommendedHours: 2,
                weightagePercent: 3,
                competencies: ["Fact recall"]
              },
              {
                id: "cuet-gt-economy",
                name: "Economic & Business News",
                slug: "economic-news",
                difficulty: "foundation",
                tags: ["current-affairs"],
                prerequisites: [],
                recommendedHours: 2,
                weightagePercent: 3,
                competencies: ["Awareness"]
              }
            ]
          }
        ]
      }
    ]
  }
};

