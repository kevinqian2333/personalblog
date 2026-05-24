import projectsData from "./projects.json";

export interface Project {
  id: string;
  title: string;
  description: string;
  cover: string;
  techs: string[];
  github: string;
  demo: string;
  category: string;
}

export const projects: Project[] = projectsData.projects;
