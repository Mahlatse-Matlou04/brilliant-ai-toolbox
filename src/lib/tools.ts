export type FieldType = "text" | "textarea" | "select";

export type ToolField = {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  helper?: string;
};

export type ToolId = "homework" | "notes" | "planner" | "research" | "email";

export type ToolConfig = {
  id: ToolId;
  name: string;
  tagline: string;
  icon: string;
  fields: ToolField[];
  outputTitle: string;
};

export const STUDY_LEVELS = [
  "Grade 8-9",
  "Grade 10-11",
  "Grade 12 (Matric / NSC)",
  "TVET / College",
  "University 1st year",
  "University 2nd year",
  "University 3rd year",
  "Honours / Postgraduate",
];

export const TOOLS: Record<ToolId, ToolConfig> = {
  homework: {
    id: "homework",
    name: "Homework Helper",
    tagline: "Understand the question, then solve it step by step — never a copy-paste answer.",
    icon: "BookOpenCheck",
    outputTitle: "Guided walkthrough",
    fields: [
      { name: "subject", label: "Subject or module", type: "text", placeholder: "e.g. Mathematics, Accounting 101, Life Sciences", required: true },
      { name: "level", label: "Study level", type: "select", options: STUDY_LEVELS, required: true },
      {
        name: "mode",
        label: "How should ELFA help?",
        type: "select",
        options: [
          "Explain the concept simply",
          "Guide me step by step (no final answer)",
          "Worked example with full steps",
          "Check and improve my own attempt",
        ],
        required: true,
      },
      { name: "question", label: "The question or task", type: "textarea", placeholder: "Paste the homework question exactly as it appears...", required: true },
      { name: "attempt", label: "Your own attempt (optional)", type: "textarea", placeholder: "Show what you tried so far — ELFA gives better feedback.", helper: "Optional, but strongly recommended for honest learning." },
    ],
  },
  notes: {
    id: "notes",
    name: "Lecture Notes Summariser",
    tagline: "Turn long lecture or class notes into a study-ready summary with action items.",
    icon: "NotebookPen",
    outputTitle: "Study summary",
    fields: [
      { name: "module", label: "Module or subject", type: "text", placeholder: "e.g. Business Management 2A", required: true },
      { name: "level", label: "Study level", type: "select", options: STUDY_LEVELS, required: true },
      { name: "notes", label: "Your notes or transcript", type: "textarea", placeholder: "Paste your lecture notes, class notes or recording transcript here...", required: true },
      { name: "focus", label: "Focus (optional)", type: "text", placeholder: "e.g. what will be examined, key definitions" },
    ],
  },
  planner: {
    id: "planner",
    name: "Study Planner",
    tagline: "A realistic, prioritised study timetable built around your deadlines.",
    icon: "CalendarClock",
    outputTitle: "Your study plan",
    fields: [
      { name: "period", label: "Plan type", type: "select", options: ["Daily plan", "Weekly plan", "Exam cram week"], required: true },
      { name: "hours", label: "Study hours available per day", type: "text", placeholder: "e.g. 3", required: true },
      { name: "tasks", label: "Tasks, assignments and tests", type: "textarea", placeholder: "One per line, with due dates. e.g.\nStats assignment 2 - due 12 Sep\nBiology test - 15 Sep\nEssay draft - 20 Sep", required: true },
      { name: "constraints", label: "Other commitments (optional)", type: "textarea", placeholder: "e.g. part-time job Mon/Wed 17:00-21:00, travel 1 hour each way" },
    ],
  },
  research: {
    id: "research",
    name: "Research Assistant",
    tagline: "Summarise a topic or article and get insights, angles and next steps.",
    icon: "Telescope",
    outputTitle: "Research brief",
    fields: [
      { name: "topic", label: "Topic or research question", type: "text", placeholder: "e.g. Impact of load shedding on small businesses in South Africa", required: true },
      { name: "level", label: "Study level", type: "select", options: STUDY_LEVELS, required: true },
      { name: "depth", label: "Depth", type: "select", options: ["Quick overview", "Assignment-ready brief", "Deep dive with counter-arguments"], required: true },
      { name: "source", label: "Article or source text (optional)", type: "textarea", placeholder: "Paste an article or extract to summarise instead of a general topic." },
    ],
  },
  email: {
    id: "email",
    name: "Academic Email Writer",
    tagline: "Professional emails to lecturers, tutors and admin — in the right tone.",
    icon: "Mail",
    outputTitle: "Draft email",
    fields: [
      { name: "recipient", label: "Who are you writing to?", type: "text", placeholder: "e.g. Dr Nkosi, my Statistics lecturer", required: true },
      { name: "tone", label: "Tone", type: "select", options: ["Formal", "Friendly but professional", "Persuasive (making a request)", "Apologetic"], required: true },
      { name: "purpose", label: "What do you need?", type: "textarea", placeholder: "e.g. request an extension for my assignment because I was ill, I have a doctor's note", required: true },
      { name: "details", label: "Details to include (optional)", type: "textarea", placeholder: "Module code, student number, dates, attachments..." },
    ],
  },
};

export const TOOL_LIST = Object.values(TOOLS);

export const AI_DISCLAIMER =
  "ELFA is a study aid, not a substitute for your own work. AI can be wrong — always verify facts against your textbook, lecturer or official sources. Submitting AI text as your own may breach your school or university's academic integrity policy.";
