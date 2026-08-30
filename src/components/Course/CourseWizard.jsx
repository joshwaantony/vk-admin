"use client";
import { useEffect, useState } from "react";
import CreateCourse from "./CreateCourse";
import CourseContent from "./CourseContent";
import CreateModules from "./CreateModules";
import useCourseStore from "@/store/useCourseStore";

export default function CourseWizard({ onClose }) {
  const { currentCourse } = useCourseStore();
  const [step, setStep] = useState(1);

  useEffect(() => {
    setStep(1);
  }, [currentCourse]);

  return (
    <>
      {step === 1 && (
        <CreateCourse
          onCancel={onClose}
          onSuccess={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <CourseContent
          onCancel={onClose}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <CreateModules
          onCancel={() => setStep(2)}
          onFinish={onClose}
        />
      )}
    </>
  );
}