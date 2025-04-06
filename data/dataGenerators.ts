import { subDays, format, startOfWeek, getWeek } from "date-fns";

// --- Interfaces ---
interface HighRiskGoalDataEntry {
  date: Date;
  week: string;
  tooltipLabel: string;
  highRiskRate: number;
  criticalPathChanges: number;
  securityImpact: number;
  multiServiceChanges: number;
  [key: string]: any;
}

interface CycleTimeData {
  date: Date;
  week: string;
  tooltipLabel: string;
  codingTime: number;
  pickupTime: number;
  reviewTime: number;
  mergeTime: number;
  [key: string]: any;
}

interface PRReviewGoalDataEntry {
  date: Date;
  week: string;
  tooltipLabel: string;
  reviewCoverage: number;
  reviewerCount: number;
  timeToFirstReview: number;
  approvalRate: number;
  [key: string]: any;
}

interface GoalDataEntry {
  date: Date;
  week: string;
  tooltipLabel: string;
  productivity: number;
  quality: number;
  learning: number;
  teamwork: number;
  [key: string]: any;
}

interface PRSizeGoalDataEntry {
  date: Date;
  week: string;
  tooltipLabel: string;
  smallPRPercentage: number;
  avgPRSize: number;
  reviewTime: number;
  mergeSuccess: number;
  [key: string]: any;
}

interface PRReviewTimeGoalDataEntry {
  date: Date;
  week: string;
  tooltipLabel: string;
  reviewCompletionTime: number;
  staleReviewRate: number;
  iterationCount: number;
  firstPassRate: number;
  [key: string]: any;
}

interface PRPickupGoalDataEntry {
  date: Date;
  week: string;
  tooltipLabel: string;
  pickupTime: number;
  staleRate: number;
  assigneePickupRate: number;
  teamResponseTime: number;
  [key: string]: any;
}

interface PRMergeTimeGoalDataEntry {
  date: Date;
  week: string;
  tooltipLabel: string;
  mergeTime: number;
  staleMergeRate: number;
  mergeSuccessRate: number;
  conflictRate: number;
  [key: string]: any;
}

// --- Existing Generators ---
export const generatePRTypeData = () => {
  const today = new Date();
  const data = [];

  // Generate data for exactly 52 weeks
  for (let i = 51; i >= 0; i--) {
    const date = subDays(today, i * 7);
    const weekNumber = getWeek(date);
    const weekKey = `W${String(weekNumber).padStart(2, '0')}`;
    const tooltipLabel = `Week ${weekNumber}, ${format(date, 'yyyy')}`;
    data.push({
      date,
      week: weekKey,
      tooltipLabel,
      feature: Math.floor(Math.random() * 8) + 2,
      bugfix: Math.floor(Math.random() * 6) + 1,
      chore: Math.floor(Math.random() * 4) + 1,
      security: Math.floor(Math.random() * 2) + 1,
      documentation: Math.floor(Math.random() * 3) + 1,
      enhancement: Math.floor(Math.random() * 5) + 1,
      refactor: Math.floor(Math.random() * 4) + 1,
      test: Math.floor(Math.random() * 3) + 1,
    });
  }

  return data;
};

export const generatePRStatusData = () => {
  const today = new Date();
  const data = [];

  // Generate data for exactly 52 weeks
  for (let i = 51; i >= 0; i--) {
    const date = subDays(today, i * 7);
    const weekNumber = getWeek(date);
    const weekKey = `W${String(weekNumber).padStart(2, '0')}`;
    const tooltipLabel = `Week ${weekNumber}, ${format(date, 'yyyy')}`;
    data.push({
      date,
      week: weekKey,
      tooltipLabel,
      open: Math.floor(Math.random() * 5) + 1,
      merged: Math.floor(Math.random() * 8) + 2,
      closed: Math.floor(Math.random() * 3) + 1,
      draft: Math.floor(Math.random() * 2) + 1,
      inReview: Math.floor(Math.random() * 4) + 1,
    });
  }

  return data;
};

export const generatePRSizeData = () => {
  const today = new Date();
  const data = [];

  // Generate data for exactly 52 weeks
  for (let i = 51; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i * 7);
    const weekNumber = Math.floor(1 + i);
    const weekKey = `W${String(weekNumber).padStart(2, "0")}`;
    const tooltipLabel = `Week ${weekNumber}, ${date.getFullYear()}`;

    // Generate random data for each size category
    data.push({
      date,
      week: weekKey,
      tooltipLabel,
      xs: Math.floor(Math.random() * 20 + 5), // 5-25 PRs
      s: Math.floor(Math.random() * 30 + 10), // 10-40 PRs
      m: Math.floor(Math.random() * 15 + 5), // 5-20 PRs
      l: Math.floor(Math.random() * 8 + 2), // 2-10 PRs
      xl: Math.floor(Math.random() * 4 + 1), // 1-5 PRs
      xxl: Math.floor(Math.random() * 2), // 0-2 PRs
    });
  }

  return data;
};

export const generatePRLOCData = () => {
  const today = new Date();
  const data = [];

  // Generate data for exactly 52 weeks
  for (let i = 51; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i * 7);
    const weekNumber = Math.floor(1 + i);
    const weekKey = `W${String(weekNumber).padStart(2, "0")}`;
    const tooltipLabel = `Week ${weekNumber}, ${date.getFullYear()}`;

    // Generate random data for LOC metrics
    const additions = Math.floor(Math.random() * 5000 + 1000); // 1000-6000 lines
    const deletions = Math.floor(Math.random() * 2000 + 500); // 500-2500 lines
    const netChange = additions - deletions;

    data.push({
      date,
      week: weekKey,
      tooltipLabel,
      loc: additions + deletions, // Total lines changed
      additions,
      deletions,
      netChange,
    });
  }

  return data;
};

export function generateDeploymentCountData() {
  const data = [];
  const today = new Date();
  
  for (let i = 51; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i * 7); // Keep date for potential future use/filtering
    const weekNumber = 52 - i;
    const weekKey = `W${String(weekNumber).padStart(2, "0")}`;

    const deployments = Math.floor(Math.random() * 20) + 10;
    const failures = Math.floor(Math.random() * (deployments * 0.3));
    const cfr = (failures / deployments) * 100;
    const mtr = Math.floor(Math.random() * 120) + 30;
    
    data.push({
      date: date.toISOString(), // Keep date for filtering
      week: weekKey, // Use week for X-axis
      deployments,
      failures,
      cfr,
      mtr,
      successful: deployments - failures, // Keep successful calculation
    });
  }
  
  return data;
}

export function generateDeploymentFocusData() {
  const data = [];
  const today = new Date();
  
  for (let i = 51; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i * 7); // Keep date for potential future use/filtering
    const weekNumber = 52 - i;
    const weekKey = `W${String(weekNumber).padStart(2, "0")}`;
    
    data.push({
      date: date.toISOString(), // Keep date for filtering
      week: weekKey, // Use week for X-axis
      features: Math.floor(Math.random() * 8) + 2,
      security: Math.floor(Math.random() * 4) + 1,
      chores: Math.floor(Math.random() * 6) + 2,
      documentation: Math.floor(Math.random() * 3) + 1,
      bugfixes: Math.floor(Math.random() * 5) + 1,
    });
  }
  
  return data;
}

// --- New Generators ---
export const generateHighRiskGoalsData = (): HighRiskGoalDataEntry[] => {
  const today = new Date();
  const data = [];
  for (let i = 51; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i * 7);
    const weekNumber = Math.floor(1 + i);
    const weekKey = `W${String(weekNumber).padStart(2, "0")}`;
    const tooltipLabel = `Week ${weekNumber}, ${date.getFullYear()}`;

    // Progress factor that improves metrics over time
    const progress = (52 - i) / 52; // 0 to 1
    const randomVariation = () => (Math.random() - 0.5) * 5; // ±2.5 variation

    // Start with challenging metrics that improve over time
    data.push({
      date,
      week: weekKey,
      tooltipLabel,
      // High risk PR rate should decrease (target: 10%)
      highRiskRate: Math.max(5, Math.min(25, 20 - progress * 10 + randomVariation())),
      // Critical path changes should decrease (target: 5%)
      criticalPathChanges: Math.max(2, Math.min(15, 12 - progress * 7 + randomVariation())),
      // Security impact should decrease (target: 3%)
      securityImpact: Math.max(1, Math.min(10, 8 - progress * 5 + randomVariation())),
      // Multi-service changes should decrease (target: 15%)
      multiServiceChanges: Math.max(5, Math.min(30, 25 - progress * 10 + randomVariation())),
    });
  }
  return data;
};

export const generateCycleTimeData = (): CycleTimeData[] => {
  const today = new Date();
  const data = [];
  for (let i = 51; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i * 7);
    const weekNumber = Math.floor(1 + i);
    const weekKey = `W${String(weekNumber).padStart(2, "0")}`;
    const tooltipLabel = `Week ${weekNumber}, ${date.getFullYear()}`;
    data.push({
      date,
      week: weekKey,
      tooltipLabel,
      codingTime: Math.random() * 5 + 2, // 2-7 hours
      pickupTime: Math.random() * 8 + 4, // 4-12 hours
      reviewTime: Math.random() * 10 + 6, // 6-16 hours
      mergeTime: Math.random() * 2 + 0.1, // 0.1-2.1 hours
    });
  }
  return data;
};

export const generatePRReviewGoalsData = (): PRReviewGoalDataEntry[] => {
  const today = new Date();
  const data = [];
  for (let i = 51; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i * 7);
    const weekNumber = Math.floor(1 + i);
    const weekKey = `W${String(weekNumber).padStart(2, "0")}`;
    const tooltipLabel = `Week ${weekNumber}, ${date.getFullYear()}`;

    // Progress factor that improves metrics over time
    const progress = (52 - i) / 52; // 0 to 1
    const randomVariation = () => (Math.random() - 0.5) * 10; // ±5 variation

    // Start with challenging metrics that improve over time
    data.push({
      date,
      week: weekKey,
      tooltipLabel,
      // Review coverage should be very high (target: 100%)
      reviewCoverage: Math.min(100, Math.max(80, 90 + progress * 10 + randomVariation())),
      // Average reviewers per PR should increase (target: 2)
      reviewerCount: Math.min(3, Math.max(1, 1.5 + progress * 0.5 + randomVariation() * 0.1)),
      // Time to first review should decrease (target: 4 hours)
      timeToFirstReview: Math.max(2, Math.min(8, 6 - progress * 2 + randomVariation() * 0.2)),
      // Approval rate should increase (target: 90%)
      approvalRate: Math.min(100, Math.max(70, 80 + progress * 10 + randomVariation())),
    });
  }
  return data;
};

export const generateGoalsData = (): GoalDataEntry[] => {
  const today = new Date();
  const data = [];
  for (let i = 51; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i * 7);
    const weekNumber = Math.floor(1 + i);
    const weekKey = `W${String(weekNumber).padStart(2, "0")}`;
    const tooltipLabel = `Week ${weekNumber}, ${date.getFullYear()}`;

    // Generate random values that trend towards their targets over time
    const progress = (52 - i) / 52; // Progress factor (0 to 1)
    const randomVariation = () => (Math.random() - 0.5) * 20; // ±10 variation

    data.push({
      date,
      week: weekKey,
      tooltipLabel,
      productivity: Math.min(100, Math.max(50, 70 + progress * 15 + randomVariation())),
      quality: Math.min(100, Math.max(50, 75 + progress * 15 + randomVariation())),
      learning: Math.min(100, Math.max(50, 65 + progress * 15 + randomVariation())),
      teamwork: Math.min(100, Math.max(50, 80 + progress * 15 + randomVariation())),
    });
  }
  return data;
};

export const generatePRSizeGoalsData = (): PRSizeGoalDataEntry[] => {
  const today = new Date();
  const data = [];
  for (let i = 51; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i * 7);
    const weekNumber = Math.floor(1 + i);
    const weekKey = `W${String(weekNumber).padStart(2, "0")}`;
    const tooltipLabel = `Week ${weekNumber}, ${date.getFullYear()}`;

    // Progress factor that improves metrics over time
    const progress = (52 - i) / 52; // 0 to 1
    const randomVariation = () => (Math.random() - 0.5) * 10; // ±5 variation

    // Start with challenging metrics that improve over time
    data.push({
      date,
      week: weekKey,
      tooltipLabel,
      // Percentage of small PRs should increase (target: 80%)
      smallPRPercentage: Math.min(95, Math.max(40, 60 + progress * 20 + randomVariation())),
      // Average PR size should decrease (target: 150 LOC)
      avgPRSize: Math.max(100, Math.min(500, 300 - progress * 150 + randomVariation() * 5)),
      // Review time should decrease (target: 24 hours)
      reviewTime: Math.max(12, Math.min(48, 36 - progress * 12 + randomVariation() * 0.5)),
      // Merge success rate should increase (target: 95%)
      mergeSuccess: Math.min(100, Math.max(80, 85 + progress * 10 + randomVariation())),
    });
  }
  return data;
};

export const generatePRReviewTimeGoalsData = (): PRReviewTimeGoalDataEntry[] => {
  const today = new Date();
  const data = [];
  for (let i = 51; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i * 7);
    const weekNumber = Math.floor(1 + i);
    const weekKey = `W${String(weekNumber).padStart(2, "0")}`;
    const tooltipLabel = `Week ${weekNumber}, ${date.getFullYear()}`;

    // Progress factor that improves metrics over time
    const progress = (52 - i) / 52; // 0 to 1
    const randomVariation = () => (Math.random() - 0.5) * 10; // ±5 variation

    // Start with challenging metrics that improve over time
    data.push({
      date,
      week: weekKey,
      tooltipLabel,
      // Review completion time should decrease (target: 24 hours)
      reviewCompletionTime: Math.max(12, Math.min(48, 36 - progress * 12 + randomVariation() * 0.5)),
      // Stale review rate should decrease (target: 5%)
      staleReviewRate: Math.max(2, Math.min(20, 15 - progress * 10 + randomVariation() * 0.5)),
      // Average iterations should decrease (target: 2)
      iterationCount: Math.max(1, Math.min(5, 4 - progress * 2 + randomVariation() * 0.2)),
      // First pass rate should increase (target: 80%)
      firstPassRate: Math.min(100, Math.max(50, 60 + progress * 20 + randomVariation())),
    });
  }
  return data;
};

export const generatePRPickupGoalsData = (): PRPickupGoalDataEntry[] => {
  const today = new Date();
  const data = [];
  for (let i = 51; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i * 7);
    const weekNumber = Math.floor(1 + i);
    const weekKey = `W${String(weekNumber).padStart(2, "0")}`;
    const tooltipLabel = `Week ${weekNumber}, ${date.getFullYear()}`;

    // Progress factor that improves metrics over time
    const progress = (52 - i) / 52; // 0 to 1
    const randomVariation = () => (Math.random() - 0.5) * 10; // ±5 variation

    // Start with challenging metrics that improve over time
    data.push({
      date,
      week: weekKey,
      tooltipLabel,
      // Average pickup time should decrease (target: 12 hours)
      pickupTime: Math.max(4, Math.min(24, 18 - progress * 6 + randomVariation() * 0.5)),
      // Stale PR rate should decrease (target: 5%)
      staleRate: Math.max(2, Math.min(20, 15 - progress * 10 + randomVariation() * 0.5)),
      // Assignee pickup rate should increase (target: 90%)
      assigneePickupRate: Math.min(100, Math.max(70, 80 + progress * 10 + randomVariation())),
      // Team response time should decrease (target: 4 hours)
      teamResponseTime: Math.max(2, Math.min(8, 6 - progress * 2 + randomVariation() * 0.2)),
    });
  }
  return data;
};

export const generatePRMergeTimeGoalsData = (): PRMergeTimeGoalDataEntry[] => {
  const today = new Date();
  const data = [];
  for (let i = 51; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i * 7);
    const weekNumber = Math.floor(1 + i);
    const weekKey = `W${String(weekNumber).padStart(2, "0")}`;
    const tooltipLabel = `Week ${weekNumber}, ${date.getFullYear()}`;

    // Progress factor that improves metrics over time
    const progress = (52 - i) / 52; // 0 to 1
    const randomVariation = () => (Math.random() - 0.5) * 10; // ±5 variation

    // Start with challenging metrics that improve over time
    data.push({
      date,
      week: weekKey,
      tooltipLabel,
      // Merge time should decrease (target: 48 hours)
      mergeTime: Math.max(24, Math.min(72, 60 - progress * 24 + randomVariation())),
      // Stale merge rate should decrease (target: 5%)
      staleMergeRate: Math.max(2, Math.min(20, 15 - progress * 10 + randomVariation() * 0.5)),
      // Merge success rate should increase (target: 95%)
      mergeSuccessRate: Math.min(100, Math.max(80, 85 + progress * 10 + randomVariation())),
      // Conflict rate should decrease (target: 10%)
      conflictRate: Math.max(2, Math.min(25, 20 - progress * 10 + randomVariation() * 0.5)),
    });
  }
  return data;
}; 