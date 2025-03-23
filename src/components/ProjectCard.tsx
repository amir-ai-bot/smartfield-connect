
// This file is read-only. Duplicating the type here to fix the error in Projects.tsx
// The ProjectCardProps type definition should include string for status
export type ProjectCardProps = {
  id: string;
  title: string;
  crop: string;
  location: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: string | "active" | "completed" | "planning";
  image: string;
};
