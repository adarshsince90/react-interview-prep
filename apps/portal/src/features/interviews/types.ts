export type InterviewTab = 'simulation' | 'specs' | 'rubric' | 'defense';

export interface SocraticTurn {
  id: string;
  phaseNumber: number;
  phaseTitle: string;
  interviewerPrompt: string;
  interviewerTone: string;
  candidateClarifications: string[];
  keySignalsToDemonstrate: string[];
  candidateResponseDefense: string;
  deepDiveTip?: string;
}

export interface RubricLevel {
  score: number;
  title: string;
  description: string;
}

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  weight: string;
  levels: RubricLevel[];
}

export interface ArchitectureCodeSnippet {
  title: string;
  language: string;
  code: string;
  explanation: string;
}

export interface TradeoffComparison {
  approach: string;
  latencyAndPerf: string;
  memoryAndComplexity: string;
  resilienceAndRisk: string;
  verdict: string;
}

export interface TrafficMetric {
  metric: string;
  value: string;
  implication: string;
}

export interface InterviewScenario {
  id: string;
  number: string;
  title: string;
  track: 'System Design & Graphics' | 'Enterprise Architecture' | 'Runtime Internals' | 'Executive Migration';
  difficulty: 'Staff Architect' | 'Principal Architect';
  durationMinutes: number;
  tagline: string;
  color: string;
  
  // Tab 1: Socratic Simulation
  scenarioIntroduction: string;
  interviewerProfile: {
    name: string;
    role: string;
    companyProfile: string;
    interviewStyle: string;
  };
  socraticTurns: SocraticTurn[];
  
  // Tab 2: System Specs & Constraints
  specs: {
    functionalRequirements: string[];
    nonFunctionalRequirements: string[];
    trafficAndVolumeCalculations: TrafficMetric[];
    outOfScope: string[];
  };

  // Tab 3: Evaluation Rubric & Scorecard
  rubricCriteria: RubricCriterion[];

  // Tab 4: Publication-Grade Architectural Defense Transcript
  defenseTranscript: {
    elevatorPitch: string;
    asciiDiagram: string;
    coreArchitectureText: string;
    codeSnippets: ArchitectureCodeSnippet[];
    tradeoffMatrix: TradeoffComparison[];
    staffProTips: string[];
  };
}
