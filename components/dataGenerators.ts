import { subDays, format, startOfWeek, getWeek } from "date-fns";

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