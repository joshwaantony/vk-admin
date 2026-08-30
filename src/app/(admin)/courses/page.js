//app/admin/courses/page.js
"use client";
import React, { useEffect, useState } from "react";
import { RiDeleteBin5Line } from "react-icons/ri";
import { MdEditNote } from "react-icons/md";
import CourseWizard from "@/components/Course/CourseWizard";
import useCourseStore from "@/store/useCourseStore";

function DeleteCourseModal({
  open,
  courseTitle,
  onClose,
  onConfirm,
  deleting,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-[#1f304a]">Delete Course</h2>

        <p className="mt-3 text-sm text-gray-600 leading-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-gray-900">
            {courseTitle || "this course"}
          </span>
          ? This action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="rounded-xl bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={deleting}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [showWizard, setShowWizard] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [deletingCourseId, setDeletingCourseId] = useState(null);

  const { fetchCourseById } = useCourseStore();
  const {
    courses,
    fetchCourses,
    setCurrentCourse,
    deleteCourse,
    setCourseId,
    togglePopular,
  } = useCourseStore();

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Refetch when the wizard closes so newly-published courses show their real totalVideos
  // immediately instead of the stale 0 the backend may return mid-publish.
  useEffect(() => {
    if (!showWizard) {
      fetchCourses();
    }
  }, [showWizard, fetchCourses]);

  const openDeleteModal = (course) => {
    setSelectedCourse(course);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deletingCourseId) return;
    setDeleteModalOpen(false);
    setSelectedCourse(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCourse?.id) return;

    try {
      setDeletingCourseId(selectedCourse.id);
      await deleteCourse(selectedCourse.id);
      setDeleteModalOpen(false);
      setSelectedCourse(null);
    } catch (error) {
      console.error("Delete failed", error);
    } finally {
      setDeletingCourseId(null);
    }
  };

  const handleEdit = async (course) => {
    try {
      setCourseId(course.id);
      
      // Always fetch full details (including promos/sections) 
      // instead of using the shallow data from the list
      await fetchCourseById(course.id);

      setShowWizard(true);
    } catch (error) {
      console.error("Failed to load course", error);
    }
  };

  return (
    <>
      {!showWizard && (
        <div className="mt-[25px] px-4 sm:px-6 md:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-[27px] font-medium text-[#1f304a]">Courses</h1>

            <button
              onClick={() => {
                setEditingIndex(null);
                setCourseId(null);
                useCourseStore.getState().resetCourse();
                setShowWizard(true);
              }}
              className="rounded-xl bg-[#1f304a] px-4 py-2 text-[16px] text-white transition-colors duration-300 hover:bg-[#314279] xl:text-[18px] font-medium"
            >
              Add New Course
            </button>
          </div>

          <div className="space-y-2">
            {courses?.map((course) => {
              const isDeleting = deletingCourseId === course.id;

              return (
                <div
                  key={course.id}
                  className="mt-5 grid grid-cols-1 place-items-center gap-2 rounded-[15px] border border-[#A9BEE2] bg-[#E3EAF8] p-4 text-center sm:grid-cols-2 sm:p-5 lg:grid-cols-6"
                >
                  <div>
                    <p className="text-xs text-gray-500">Course title</p>
                    <p className="font-medium">{course.title}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p>{course.status}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Course amount</p>
                    <p>{course.price}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Total Videos</p>
                    <p>{course.totalVideos}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Popular</p>

                    <button
                      disabled={course.status === "DRAFT" || isDeleting}
                      onClick={() =>
                        course.status !== "DRAFT" &&
                        togglePopular(course.id, course.isPopular)
                      }
                      className={`flex h-5 w-10 items-center rounded-full p-1 transition ${
                        course.isPopular ? "bg-blue-950" : "bg-gray-300"
                      } ${
                        course.status === "DRAFT" || isDeleting
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer"
                      }`}
                    >
                      <div
                        className={`h-4 w-4 rounded-full bg-white shadow-md transform transition ${
                          course.isPopular ? "translate-x-5" : ""
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => openDeleteModal(course)}
                      disabled={isDeleting}
                      className="text-[22px] text-gray-600 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isDeleting ? "..." : <RiDeleteBin5Line />}
                    </button>

                    <button
                      onClick={() => handleEdit(course)}
                      disabled={isDeleting}
                      className="text-[28px] text-gray-600 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <MdEditNote />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showWizard && (
        <CourseWizard
          onClose={() => setShowWizard(false)}
          editingIndex={editingIndex}
        />
      )}

      <DeleteCourseModal
        open={deleteModalOpen}
        courseTitle={selectedCourse?.title}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        deleting={!!deletingCourseId}
      />
    </>
  );
}
