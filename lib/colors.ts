export const blueColors = [
  "#3b82f6", // Darkest blue
  "#538ef8",
  "#6899fa",
  "#7aa5fb",
  "#8cb1fc",
  "#9dbdfd",
  "#aec9fe",
  "#bfd4ff",
  "#d0e0ff", // Lightest blue
];

// Helper function to get colors based on index
export const getColorFromPalette = (index: number): string => {
  return blueColors[index % blueColors.length];
}; 