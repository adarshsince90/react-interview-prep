export type IncidentSeverity = 'P0' | 'P1' | 'P2';
export type IncidentStatus = 'ACTIVE' | 'TRIAGING' | 'MITIGATED' | 'RESOLVED';
export type IncidentCategory = 'memory-leak' | 'inp-performance' | 'security-xss' | 'mfe-dependency';

export type TimelinePhase = 'ALERT' | 'TRIAGE' | 'DIAGNOSIS' | 'HOTFIX' | 'RESOLVED';

export interface TimelineEvent {
  id: string;
  timestamp: string; // e.g. "09:14 UTC"
  phase: TimelinePhase;
  role: string; // e.g. "Datadog RUM Bot", "On-Call Lead", "Staff Architect"
  message: string;
  severity?: 'critical' | 'warning' | 'info' | 'success';
}

export interface MetricDataPoint {
  time: string;
  value: number;
  threshold?: number;
  unit: string;
}

export interface DiagnosticAction {
  id: string;
  label: string;
  category: 'heap' | 'performance' | 'network' | 'dependencies' | 'storage';
  commandOrTool: string; // e.g. "Chrome DevTools > Memory > Take Heap Snapshot"
  hypothesis: string;
  outputSummary: string;
  detailedFindings: string[];
  evidenceBadge: string;
}

export interface HotfixDiff {
  filename: string;
  language: string;
  explanation: string;
  beforeCode: string;
  afterCode: string;
  architecturalGuardrail: string;
}

export interface FiveWhysStep {
  step: number;
  question: string;
  answer: string;
}

export interface PostMortemRca {
  title: string;
  incidentCommander: string;
  blastRadius: string;
  financialOrSlaImpact: string;
  timeToDetect: string;
  timeToMitigate: string;
  timeToResolve: string;
  executiveSummary: string;
  rootCause: string;
  fiveWhys: FiveWhysStep[];
  detectionGaps: string[];
  preventions: {
    immediate: string[];
    shortTerm: string[];
    longTermArchitectural: string[];
  };
}

export interface IncidentCase {
  id: string; // "INC-01", etc.
  title: string;
  tagline: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  affectedSystem: string;
  activeUsersAffected: string;
  summary: string;
  timelineEvents: TimelineEvent[];
  telemetry: {
    metricName: string;
    description: string;
    unit: string;
    dataPoints: MetricDataPoint[];
    healthyThreshold: number;
    peakBreach: number;
  };
  diagnosticActions: DiagnosticAction[];
  hotfix: HotfixDiff;
  rca: PostMortemRca;
}
