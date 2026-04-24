export type ResumeEducation = {
  id: string;
  school: string;
  degree: string;
  year: string;
  grade: string;
};

export type ResumeExperience = {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string;
};

export type ResumeProject = {
  id: string;
  title: string;
  link: string;
  description: string;
};

export interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  github: string;
  codingProfiles: string;
  skills: string;
  summary: string;
  education: ResumeEducation[];
  experience: ResumeExperience[];
  projects: ResumeProject[];
}
