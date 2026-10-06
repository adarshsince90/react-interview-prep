export interface HeadingItem {
  title: string;
  anchor: string;
}

export interface LabMapping {
  labId: string;
  title: string;
  description: string;
}

export interface TopicItem {
  id: string;
  filename: string;
  phaseId: string;
  title: string;
  relativePath: string;
  wordCount: number;
  readingTimeMin: number;
  headings: HeadingItem[];
  lab: LabMapping | null;
}

export interface PhaseItem {
  id: string;
  title: string;
  badge: string;
  description: string;
  dirName: string;
  topicCount: number;
  topics: TopicItem[];
}

export interface ManifestData {
  generatedAt: string;
  totalPhases: number;
  totalTopics: number;
  phases: PhaseItem[];
}
