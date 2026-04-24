"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useState } from "react";

type ResumeEducation = {
  id: string;
  school: string;
  degree: string;
  year: string;
  grade: string;
};

type ResumeExperience = {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string;
};

type ResumeProject = {
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

const defaultResumeData: ResumeData = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  linkedin: "",
  github: "",
  codingProfiles: "",
  skills: "",
  summary: "",
  education: [
    { id: "edu-1", school: "", degree: "", year: "", grade: "" },
  ],
  experience: [
    {
      id: "exp-1",
      company: "",
      role: "",
      duration: "",
      description: "",
    },
  ],
  projects: [{ id: "proj-1", title: "", link: "", description: "" }],
};

const editorInputClassName =
  "mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 outline-none transition focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-500/30";

const sectionTitleClassName =
  "text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]";

export function ResumeBuilder() {
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);

  const updateField = (
    field: keyof Omit<
      ResumeData,
      "experience" | "education" | "projects"
    >,
  ) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setResumeData((prev) => ({ ...prev, [field]: value }));
    };

  const addEducation = () => {
    setResumeData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: `edu-${Date.now()}`,
          school: "",
          degree: "",
          year: "",
          grade: "",
        },
      ],
    }));
  };

  const removeEducation = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((item) => item.id !== id),
    }));
  };

  const updateEducation = (
    id: string,
    field: keyof Omit<ResumeEducation, "id">,
    value: string,
  ) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const addExperience = () => {
    setResumeData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: `exp-${Date.now()}`,
          company: "",
          role: "",
          duration: "",
          description: "",
        },
      ],
    }));
  };

  const removeExperience = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((item) => item.id !== id),
    }));
  };

  const updateExperience = (
    id: string,
    field: keyof Omit<ResumeExperience, "id">,
    value: string,
  ) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const addProject = () => {
    setResumeData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          id: `proj-${Date.now()}`,
          title: "",
          link: "",
          description: "",
        },
      ],
    }));
  };

  const removeProject = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.filter((item) => item.id !== id),
    }));
  };

  const updateProject = (
    id: string,
    field: keyof Omit<ResumeProject, "id">,
    value: string,
  ) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const downloadPDF = async () => {
    if (typeof window === "undefined") {
      return;
    }

    const previewElement = document.getElementById("resume-preview");
    if (!previewElement) {
      return;
    }

    if ("fonts" in document) {
      await document.fonts.ready;
    }

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        setTimeout(() => resolve(), 80);
      });
    });

    const canvas = await html2canvas(previewElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imageData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imageData, "PNG", 0, 0, pageWidth, pageHeight);
    pdf.save("resume.pdf");
  };

  const skillItems = resumeData.skills
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const codingProfileItems = resumeData.codingProfiles
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <section className="flex-1 px-6 pb-8 sm:px-8">
      <div className="grid h-full grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-lg">
          <h3 className="text-xl font-bold tracking-tight text-white">Resume Editor</h3>
          <p className="mt-1 text-sm text-indigo-200">
            Fill in your details to generate a live resume preview.
          </p>

          <div className="mt-6 max-h-screen space-y-5 overflow-y-auto pr-1">
            <div>
              <label htmlFor="resume-full-name" className="block text-sm font-medium text-slate-200">
                Full Name
              </label>
              <input
                id="resume-full-name"
                type="text"
                value={resumeData.fullName}
                onChange={updateField("fullName")}
                placeholder="Jane Doe"
                className={editorInputClassName}
              />
            </div>

            <div>
              <label htmlFor="resume-email" className="block text-sm font-medium text-slate-200">
                Email
              </label>
              <input
                id="resume-email"
                type="email"
                value={resumeData.email}
                onChange={updateField("email")}
                placeholder="jane.doe@email.com"
                className={editorInputClassName}
              />
            </div>

            <div>
              <label htmlFor="resume-phone" className="block text-sm font-medium text-slate-200">
                Phone
              </label>
              <input
                id="resume-phone"
                type="tel"
                value={resumeData.phone}
                onChange={updateField("phone")}
                placeholder="+1 (555) 123-4567"
                className={editorInputClassName}
              />
            </div>

            <div>
              <label htmlFor="resume-address" className="block text-sm font-medium text-slate-200">
                Address
              </label>
              <input
                id="resume-address"
                type="text"
                value={resumeData.address}
                onChange={updateField("address")}
                placeholder="City, State, Country"
                className={editorInputClassName}
              />
            </div>

            <div>
              <label htmlFor="resume-linkedin" className="block text-sm font-medium text-slate-200">
                LinkedIn
              </label>
              <input
                id="resume-linkedin"
                type="url"
                value={resumeData.linkedin}
                onChange={updateField("linkedin")}
                placeholder="https://linkedin.com/in/username"
                className={editorInputClassName}
              />
            </div>

            <div>
              <label htmlFor="resume-github" className="block text-sm font-medium text-slate-200">
                GitHub
              </label>
              <input
                id="resume-github"
                type="url"
                value={resumeData.github}
                onChange={updateField("github")}
                placeholder="https://github.com/username"
                className={editorInputClassName}
              />
            </div>

            <div>
              <label htmlFor="resume-coding-profiles" className="block text-sm font-medium text-slate-200">
                Coding Profiles
              </label>
              <input
                id="resume-coding-profiles"
                type="text"
                value={resumeData.codingProfiles}
                onChange={updateField("codingProfiles")}
                placeholder="LeetCode: user, Codeforces: handle"
                className={editorInputClassName}
              />
            </div>

            <div>
              <label htmlFor="resume-skills" className="block text-sm font-medium text-slate-200">
                Skills
              </label>
              <input
                id="resume-skills"
                type="text"
                value={resumeData.skills}
                onChange={updateField("skills")}
                placeholder="React, TypeScript, Node.js, SQL"
                className={editorInputClassName}
              />
            </div>

            <div>
              <label htmlFor="resume-summary" className="block text-sm font-medium text-slate-200">
                Summary
              </label>
              <textarea
                id="resume-summary"
                value={resumeData.summary}
                onChange={updateField("summary")}
                rows={6}
                placeholder="Write a concise professional summary..."
                className={editorInputClassName}
              />
            </div>

            <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white">Education</h4>
                <button
                  type="button"
                  onClick={addEducation}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-indigo-500"
                >
                  Add Education
                </button>
              </div>

              {resumeData.education.map((item) => (
                <div key={item.id} className="space-y-3 rounded-xl border border-white/10 p-3">
                  <input
                    type="text"
                    value={item.school}
                    onChange={(event) =>
                      updateEducation(item.id, "school", event.target.value)
                    }
                    placeholder="School"
                    className={editorInputClassName}
                  />
                  <input
                    type="text"
                    value={item.degree}
                    onChange={(event) =>
                      updateEducation(item.id, "degree", event.target.value)
                    }
                    placeholder="Degree"
                    className={editorInputClassName}
                  />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      value={item.year}
                      onChange={(event) =>
                        updateEducation(item.id, "year", event.target.value)
                      }
                      placeholder="Year"
                      className={editorInputClassName}
                    />
                    <input
                      type="text"
                      value={item.grade}
                      onChange={(event) =>
                        updateEducation(item.id, "grade", event.target.value)
                      }
                      placeholder="Grade / CGPA"
                      className={editorInputClassName}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEducation(item.id)}
                    className="rounded-lg border border-rose-300/40 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-200 transition hover:bg-rose-500/20"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white">Experience</h4>
                <button
                  type="button"
                  onClick={addExperience}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-indigo-500"
                >
                  Add Experience
                </button>
              </div>

              {resumeData.experience.map((item) => (
                <div key={item.id} className="space-y-3 rounded-xl border border-white/10 p-3">
                  <input
                    type="text"
                    value={item.company}
                    onChange={(event) =>
                      updateExperience(item.id, "company", event.target.value)
                    }
                    placeholder="Company"
                    className={editorInputClassName}
                  />
                  <input
                    type="text"
                    value={item.role}
                    onChange={(event) =>
                      updateExperience(item.id, "role", event.target.value)
                    }
                    placeholder="Role"
                    className={editorInputClassName}
                  />
                  <input
                    type="text"
                    value={item.duration}
                    onChange={(event) =>
                      updateExperience(item.id, "duration", event.target.value)
                    }
                    placeholder="Duration"
                    className={editorInputClassName}
                  />
                  <textarea
                    value={item.description}
                    onChange={(event) =>
                      updateExperience(item.id, "description", event.target.value)
                    }
                    placeholder="Key impact and responsibilities"
                    rows={4}
                    className={editorInputClassName}
                  />
                  <button
                    type="button"
                    onClick={() => removeExperience(item.id)}
                    className="rounded-lg border border-rose-300/40 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-200 transition hover:bg-rose-500/20"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white">Projects</h4>
                <button
                  type="button"
                  onClick={addProject}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-indigo-500"
                >
                  Add Project
                </button>
              </div>

              {resumeData.projects.map((item) => (
                <div key={item.id} className="space-y-3 rounded-xl border border-white/10 p-3">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(event) =>
                      updateProject(item.id, "title", event.target.value)
                    }
                    placeholder="Project Title"
                    className={editorInputClassName}
                  />
                  <input
                    type="url"
                    value={item.link}
                    onChange={(event) =>
                      updateProject(item.id, "link", event.target.value)
                    }
                    placeholder="Project Link"
                    className={editorInputClassName}
                  />
                  <textarea
                    value={item.description}
                    onChange={(event) =>
                      updateProject(item.id, "description", event.target.value)
                    }
                    placeholder="Project summary and measurable impact"
                    rows={4}
                    className={editorInputClassName}
                  />
                  <button
                    type="button"
                    onClick={() => removeProject(item.id)}
                    className="rounded-lg border border-rose-300/40 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-200 transition hover:bg-rose-500/20"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-300/30 p-5 backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-end">
            <button
              type="button"
              onClick={downloadPDF}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-500"
            >
              Download PDF
            </button>
          </div>

          <div className="flex h-full items-start justify-center overflow-auto">
            <div
              id="resume-preview"
              className="aspect-[1/1.414] w-full max-w-[640px] bg-white p-8 text-[#000000] shadow-2xl"
              style={{ backgroundColor: "#ffffff", color: "#000000" }}
            >
              <header>
                <h4 className="text-3xl font-bold tracking-tight text-[#000000]">
                  {resumeData.fullName || "Your Name"}
                </h4>
                <p className="mt-1 text-sm text-[#334155]">
                  {resumeData.email || "your.email@example.com"}
                  {resumeData.phone ? ` | ${resumeData.phone}` : ""}
                </p>
                <p className="mt-1 text-xs text-[#475569]">
                  {resumeData.address || "City, State, Country"}
                </p>
                <p className="mt-1 text-xs text-[#475569]">
                  {resumeData.linkedin || "linkedin.com/in/username"}
                  {resumeData.github ? ` | ${resumeData.github}` : ""}
                </p>
                {codingProfileItems.length > 0 ? (
                  <p className="mt-1 text-xs text-[#475569]">
                    Coding Profiles: {codingProfileItems.join(" | ")}
                  </p>
                ) : null}
              </header>

              <section className="mt-8">
                <h5 className={sectionTitleClassName}>
                  Professional Summary
                </h5>
                <p className="mt-2 text-sm leading-relaxed text-[#1e293b]">
                  {resumeData.summary ||
                    "Your summary will appear here in real time as you type on the left."}
                </p>
              </section>

              <section className="mt-6">
                <h5 className={sectionTitleClassName}>Skills</h5>
                {skillItems.length > 0 ? (
                  <ul className="mt-2 list-disc pl-5 text-sm text-[#1e293b]">
                    {skillItems.map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-[#334155]">
                    Add comma-separated skills in the editor.
                  </p>
                )}
              </section>

              <section className="mt-6">
                <h5 className={sectionTitleClassName}>Education</h5>
                <div className="mt-2 space-y-3">
                  {resumeData.education.map((item) => (
                    <article key={item.id}>
                      <p className="text-sm font-semibold text-[#0f172a]">
                        {item.school || "School Name"}
                      </p>
                      <p className="text-sm text-[#1e293b]">
                        {item.degree || "Degree"}
                      </p>
                      <p className="text-xs text-[#475569]">
                        {item.year || "Year"}
                        {item.grade ? ` | ${item.grade}` : ""}
                      </p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="mt-6">
                <h5 className={sectionTitleClassName}>Experience</h5>
                <div className="mt-2 space-y-4">
                  {resumeData.experience.map((item) => (
                    <article key={item.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-[#0f172a]">
                          {item.role || "Role"}
                        </p>
                        <p className="text-xs text-[#475569]">
                          {item.duration || "Duration"}
                        </p>
                      </div>
                      <p className="text-sm text-[#1e293b]">
                        {item.company || "Company"}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-[#334155]">
                        {item.description || "Describe your impact and responsibilities."}
                      </p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="mt-6">
                <h5 className={sectionTitleClassName}>Projects</h5>
                <div className="mt-2 space-y-4">
                  {resumeData.projects.map((item) => (
                    <article key={item.id}>
                      <p className="text-sm font-semibold text-[#0f172a]">
                        {item.title || "Project Title"}
                      </p>
                      {item.link ? (
                        <p className="text-xs text-[#475569]">{item.link}</p>
                      ) : null}
                      <p className="mt-1 text-sm leading-relaxed text-[#334155]">
                        {item.description || "Summarize what you built and the result."}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
