//components/CreateModules.jsx
"use client";
import { useCallback, useRef, useState, useEffect } from "react";
import { flushSync } from "react-dom";
import PromoVideoSection from "./PromoVideoSection";
import LessonSection from "./LessonSection";
import { GoPlus } from "react-icons/go";
import useCourseStore from "@/store/useCourseStore";
import useSectionStore from "@/store/useSectionStore";
import { FaPen } from "react-icons/fa";

export default function CreateModules({ onCancel, onFinish }) {
  const { courseId, publishCourseAction, currentCourse } = useCourseStore();
  const { createSection } = useSectionStore();
  const [sections, setSections] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [sectionTitle, setSectionTitle] = useState("");
  const [promoId] = useState(null);
  const [busySections, setBusySections] = useState({});
  const moduleBusy = Object.values(busySections).some(Boolean);

  const [unsavedSections, setUnsavedSections] = useState({});
const hasUnsavedSection = Object.values(unsavedSections).some(Boolean);
const [promoUnsaved, setPromoUnsaved] = useState(false);
const handlePromoUnsavedChange = useCallback((hasUnsaved) => {
  setPromoUnsaved(Boolean(hasUnsaved));
}, []);

// Refs to imperative save handles on PromoVideoSection and each LessonSection;
// used by the Finish auto-persist loop.
const promoRef = useRef(null);
const sectionRefs = useRef({});
const setSectionRef = (id) => (el) => {
  if (el) {
    sectionRefs.current[id] = el;
  } else {
    delete sectionRefs.current[id];
  }
};
const [finishing, setFinishing] = useState(false);

const handleSectionUnsavedChange = useCallback((sectionId, hasUnsaved) => {
  setUnsavedSections((prev) => {
    const wasUnsaved = Boolean(prev[sectionId]);
    if (wasUnsaved === hasUnsaved) return prev;

    if (!hasUnsaved) {
      const next = { ...prev };
      delete next[sectionId];
      return next;
    }

    return { ...prev, [sectionId]: true };
  });
}, [])
 const handleSectionBusyChange = useCallback((sectionId, busy) => {
  setBusySections((prev) => {
    const wasBusy = Boolean(prev[sectionId]);
    if (wasBusy === busy) return prev; // proper no-op

    if (!busy) {
      const next = { ...prev };
      delete next[sectionId];
      return next;
    }

    return { ...prev, [sectionId]: true };
  });
}, []);


  /* ================= PREFILL SECTIONS ON EDIT ================= */
  useEffect(() => {
    if (!currentCourse?.sections?.length) return;

    setSections(
      currentCourse.sections.map((s) => ({
        id: s.id,
        title: s.title,
        isOpen: false,
        lessons: s.lessons || [], // pass existing lessons down
      })),
    );
  }, [currentCourse]);

  const handleCreateSection = async () => {
    if (moduleBusy) {
      alert("Please wait until video upload is completed");
      return;
    }
if (hasUnsavedSection) {
  alert("Please save the current section's lessons first");
  return;
}
    if (!sectionTitle.trim()) return;

    try {
      const data = await createSection({
        courseId,
        title: sectionTitle.trim(),
      });

      setSections((prev) => [
        ...prev.map((s) => ({ ...s, isOpen: false })),
        {
          id: data.id,
          title: sectionTitle.trim(),
          isOpen: true,
           lessons: [],
        },
      ]);

      setSectionTitle("");
      setIsAdding(false);
    } catch {
      alert("Failed to create section");
    }
  };
  const handleRemoveSection = (id) => {
  setSections((prev) => prev.filter((s) => s.id !== id));
  setBusySections((prev) => {
    if (!(id in prev)) return prev;
    const next = { ...prev };
    delete next[id];
    return next;
  });
  setUnsavedSections((prev) => {
    if (!(id in prev)) return prev;
    const next = { ...prev };
    delete next[id];
    return next;
  });
};

  const handleToggleSection = (id) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, isOpen: !s.isOpen } : { ...s, isOpen: false },
      ),
    );
  };

  const handleFinish = async () => {
    if (moduleBusy || finishing) {
      alert("Please wait until video upload is completed");
      return;
    }

    setFinishing(true);
    try {
      // Auto-persist: mount any collapsed sections so their LessonItem refs are
      // available before we iterate. flushSync forces the re-render to commit
      // synchronously so refs are populated by the time the next line runs.
      if (sections.some((s) => !s.isOpen)) {
        flushSync(() => {
          setSections((prev) => prev.map((s) => ({ ...s, isOpen: true })));
        });
      }

      if (promoUnsaved) {
        const ok = await promoRef.current?.save();
        if (!ok) return;
      }

      for (const section of sections) {
        const sectionRef = sectionRefs.current[section.id];
        if (!sectionRef?.saveUnsaved) continue;
        const ok = await sectionRef.saveUnsaved();
        if (!ok) return;
      }

      if (currentCourse?.status !== "PUBLISHED") {
        await publishCourseAction(courseId);
      }
      onFinish();
    } catch {
      alert("Failed to finish course");
    } finally {
      setFinishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-[1000px] overflow-y-auto rounded-xl bg-white p-6 px-8 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold text-[#1F304A]">
          Create modules
        </h2>

        <PromoVideoSection
          ref={promoRef}
          promoId={promoId}
          moduleBusy={moduleBusy}
          onUnsavedChange={handlePromoUnsavedChange}
        />

        <div className="mb-4 rounded-lg border border-gray-200 p-[12px] text-sm text-[#1F304A] shadow-sm">
          <div className="flex items-center gap-[5px]">
            Lessons <FaPen />
          </div>

          {sections.map((section) => (
            <LessonSection
  key={section.id}
  ref={setSectionRef(section.id)}
  sectionId={section.id}
  title={section.title}
  isOpen={section.isOpen}
  onToggle={() => handleToggleSection(section.id)}
  onDelete={() => handleRemoveSection(section.id)}
  initialLessons={section.lessons || []}
  onBusyChange={(busy) => handleSectionBusyChange(section.id, busy)}
  onUnsavedChange={(hasUnsaved) =>
    handleSectionUnsavedChange(section.id, hasUnsaved)
  }
  moduleBusy={moduleBusy}
/>
          ))}

          {isAdding && (
            <div className="mb-4 flex w-full items-center gap-3 rounded-lg bg-white p-4 shadow-md">
              <label htmlFor="module-section-title" className="sr-only">
                Section title
              </label>
              <input
                id="module-section-title"
                name="sectionTitle"
                type="text"
                autoFocus
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateSection()}
                placeholder="Section title"
                className="flex-1 border-b-2 outline-none border-gray-300 px-4 py-2"
              />

              {/* <button
                onClick={handleCreateSection}
                className="rounded-lg bg-gray-700 px-5 py-2 text-white"
              >
                Create
              </button> */}
              <button
                type="button"
                onClick={handleCreateSection}
                disabled={moduleBusy}
                className="rounded-lg bg-gray-700 px-5 py-2 text-white disabled:opacity-50"
              >
                Create
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setSectionTitle("");
                }}
                className="rounded-lg border-2 border-[#1F304A] px-5 py-2"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="mb-6 mt-6 flex justify-end">
            {/* <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1 rounded-lg p-3 shadow-md"
            >
              <GoPlus /> Add new section
            </button> */}
            <button
  type="button"
  onClick={() => {
    if (moduleBusy) {
      alert("Please wait until video upload is completed");
      return;
    }
    if (hasUnsavedSection) {
      alert("Please save the current section's lessons before adding a new section");
      return;
    }
    setIsAdding(true);
  }}
  disabled={moduleBusy || hasUnsavedSection}
  className="flex items-center gap-1 rounded-lg p-3 shadow-md disabled:cursor-not-allowed disabled:opacity-50"
>
  <GoPlus /> Add new section
</button>
          </div>
        </div>

        <div className="flex justify-end gap-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={moduleBusy}
            className="rounded-xl bg-gray-300 px-10 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          {/* <button
            onClick={handleFinish}
            className="rounded-xl bg-gray-700 px-10 py-2 text-white"
          >
            Finish
          </button> */}
          <button
            type="button"
            onClick={handleFinish}
            disabled={moduleBusy || finishing}
            className="rounded-xl bg-gray-700 px-10 py-2 text-white disabled:opacity-50"
          >
            {finishing ? "Finishing..." : "Finish"}
          </button>
        </div>
      </div>
    </div>
  );
}
