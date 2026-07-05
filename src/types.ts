/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CommitInfo {
  message: string;
  author: string;
  date: string;
}

export interface IssueInfo {
  number: number;
  title: string;
  url: string;
  commentsCount: number;
  comments?: string[];
}

export interface ComplexFileInfo {
  path: string;
  size: number;
  content: string;
}

export interface SentimentTimelinePoint {
  date: string;
  score: number; // Sentiment or frustration score
}

export interface TeamSentiment {
  frustrationScore: number; // 1-10 scale
  frustrationLabel: string; // e.g. "Low", "Moderate", "Critical Burnout Risk"
  recurringComplaints: string[];
  sentimentTimeline: SentimentTimelinePoint[];
}

export interface RefactorRadarSuggestion {
  filePath: string;
  complexityScore: number; // 1-100
  suggestions: string[];
  codeSnippetPreview?: string;
}

export interface ModuleOwnership {
  modulePath: string;
  totalCommits: number;
  contributors: { [author: string]: number };
  topContributor: string;
  topContributorPercentage: number;
  busFactorScore: number;
}

export interface BusFactorInfo {
  overallScore: number; // 1 to 10
  explanation: string;
  knowledgeSharingAction: string;
  modules: ModuleOwnership[];
}

export interface OnboardingAuditorInfo {
  score: number; // 0 (Perfect) to 100 (Impossible)
  missingFiles: string[];
  improvementTip: string;
  hasEnvExample: boolean;
  hasDocker: boolean;
  hasPrerequisites: boolean;
}

// New metric interfaces
export interface GhostPRInfo {
  number: number;
  title: string;
  url: string;
  author: string;
  ageInHours: number;
  interactionDelay?: number; // hours to first review
  status: "ghosted" | "active" | "stagnant";
}

export interface HotspotInfo {
  filePath: string;
  churnScore: number; // 0-100
  occurrences: number;
  isHotspot: boolean;
  technicalDebtScore?: number;
  hasHighDebt: boolean;
}

export interface DeveloperVitals {
  username: string;
  totalCommits: number;
  totalMentoring: number; // comments + reviews count
  modulesTouched: string[];
  daysActive: number;
  contextSwitchingTax: number; // percentage
  fragmentationRisk: "High" | "Moderate" | "Low";
  badges: string[]; // "Force Multiplier", "The Architect", "The Finisher"
  ratio: number;
}

export interface ProjectAnalysisResult {
  owner: string;
  repoName: string;
  description: string;
  starsCount: number;
  forksCount: number;
  openIssuesCount: number;
  healthScore: number;
  aiSummary: string[];
  teamSentiment: TeamSentiment;
  refactorRadar: RefactorRadarSuggestion[];
  commits?: CommitInfo[];
  issues?: IssueInfo[];
  busFactor?: BusFactorInfo;
  onboardingAuditor?: OnboardingAuditorInfo;
  
  // NEW V2 FEATURES
  ghostPRs?: GhostPRInfo[];
  hotspots?: HotspotInfo[];
  developerVitals?: DeveloperVitals[];

  // V3 FEATURES: SCOPE Stability
  scopeAnalysis?: ScopeAnalysis;
}

export interface PivotedIssue {
  number: number;
  title: string;
  originalGoal: string;
  currentGoal: string;
  shiftSeverity: number; // 1-10 Scale
  isPickyUI: boolean; // High UI volatility detected
}

export interface ScopeTimelinePoint {
  week: string;
  originalTasks: number;
  addedTasks: number;
}

export interface ScopeAnalysis {
  stabilityScore: number; // 0-100%
  totalInjectedIssues: number;
  avgRequirementChurn: number; // 1-10 Scale
  pivotedIssues: PivotedIssue[];
  timeline: ScopeTimelinePoint[];
  hasUiVolatilityWarning: boolean;
}
