// "use client";
// import { useState, useRef, useEffect } from "react";
// import useCourseStore from "@/store/useCourseStore";
// import { X } from "lucide-react";
// import { ImArrowUp } from "react-icons/im";
// import { uploadImageToCloudinary } from "../../../src/utils/cloudinaryImageUpload";
// import { MdAccountCircle } from "react-icons/md";
// import { GrGallery } from "react-icons/gr";
// import { MdOutlineFileUpload } from "react-icons/md";
// import toast from "react-hot-toast";

// export default function CreateCourse({ onCancel, onSuccess }) {
//   const { createCourse, loading, currentCourse,updateCourse } = useCourseStore();
//   const fileInputRef = useRef(null);

//   const [form, setForm] = useState({
//     title: "",
//     description: "",
//     price: "",
//     thumbnail:"",
//      faculty: [],
//   });


//   const [selectedThumbnailFile, setSelectedThumbnailFile] = useState(null);

//   const [errors, setErrors] = useState({});
//   const [thumbnailUrl, setThumbnailUrl] = useState("");
//   const [thumbnailUploading, setThumbnailUploading] = useState(false);
//   const [facultyUploading, setFacultyUploading] = useState(false);
//   const [faculty, setFaculty] = useState([]);

//   const [draftFaculty, setDraftFaculty] = useState({
//     name: "",
//     qualification: "",
//     imageUrl: "",
    
//   });

//   useEffect(() => {
//   if (currentCourse) {
//     console.log(`Current course details : ${JSON.stringify(currentCourse)}`)
//     setForm({
//       title: currentCourse.title || "",
//       description: currentCourse.description || "",
//       price: currentCourse.price || "",
//     });

//     setThumbnailUrl(currentCourse.thumbnail || "");
//     setFaculty(currentCourse.faculty || []);
//   } else {
//     // 🔥 RESET FORM WHEN CREATING NEW COURSE
//     setForm({
//       title: "",
//       description: "",
//       price: "",
//     });
//     setThumbnailUrl("");
//     setFaculty([]);
//   }
// }, [currentCourse]);

//   const handleThumbnailUpload = async (file) => {
//     if (!file) return;
//     setThumbnailUploading(true);
//     try {
//       const url = await uploadImageToCloudinary(file, "COURSE_THUMBNAIL");
//       setThumbnailUrl(url);
//       setErrors((p) => ({ ...p, thumbnail: "" }));
//     } finally {
//       setThumbnailUploading(false);
//     }
//   };

//   // const uploadFacultyImage = async (file) => {
//   //   if (!file) return;
//   //   setFacultyUploading(true);
//   //   try {
//   //     const url = await uploadImageToCloudinary(file, "FACULTY_IMAGE");
//   //     setDraftFaculty((prev) => ({ ...prev, imageUrl: url }));
//   //   } finally {
//   //     setFacultyUploading(false);
//   //   }
//   // };
//   const uploadFacultyImage = async (file) => {
//   if (!file) return;
//   setFacultyUploading(true);
//   try {
//     const url = await uploadImageToCloudinary(file, "FACULTY_IMAGE");
//     setDraftFaculty((prev) => ({ ...prev, imageUrl: url }));

//     // ✅ TOAST HERE
//     toast.success("Image uploaded successfully");
//   } finally {
//     setFacultyUploading(false);
//   }
// };

//   // const addFaculty = () => {
//   //   const newErrors = {};
//   //   if (!draftFaculty.name.trim())
//   //     newErrors.facultyName = "This field is mandatory";
//   //   if (!draftFaculty.qualification.trim())
//   //     newErrors.facultyQualification = "This field is mandatory";

//   //   if (Object.keys(newErrors).length) {
//   //     setErrors((p) => ({ ...p, ...newErrors }));
//   //     return;
//   //   }

//   //   setFaculty([...faculty, draftFaculty]);
//   //   setDraftFaculty({ name: "", qualification: "", imageUrl: "" });
//   //   setErrors((p) => ({
//   //     ...p,
//   //     faculty: "",
//   //     facultyName: "",
//   //     facultyQualification: "",
//   //   }));
//   // };
//   const addFaculty = () => {
//   const newErrors = {};

//   if (!draftFaculty.name.trim())
//     newErrors.facultyName = "This field is mandatory";

//   if (!draftFaculty.qualification.trim())
//     newErrors.facultyQualification = "This field is mandatory";

//   // if (!draftFaculty.imageUrl)
//   //   newErrors.facultyImage = "Upload image first";

//   if (Object.keys(newErrors).length) {
//     setErrors((p) => ({ ...p, ...newErrors }));
//     return;
//   }

//   setFaculty([...faculty, draftFaculty]);

//   // ✅ SUCCESS TOAST
//   toast.success("Faculty added successfully 🎉");

//   setDraftFaculty({ name: "", qualification: "", imageUrl: "" });

//   setErrors((p) => ({
//     ...p,
//     faculty: "",
//     facultyName: "",
//     facultyQualification: "",
//   }));
// };

//   const removeFaculty = (index) => {
//     setFaculty(faculty.filter((_, i) => i !== index));
//   };

//   const validateFields = () => {
//     const newErrors = {};
//     if (!form.title.trim()) newErrors.title = "This field is required";
//     if (!form.description.trim())
//       newErrors.description = "This field is required";
//     if (!thumbnailUrl) newErrors.thumbnail = "This field is required";
//     if (!form.price) newErrors.price = "This field is required";
//     if (faculty.length === 0) newErrors.faculty = "This field is required";

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   /* 🔥 HANDLE SUBMIT (CREATE OR UPDATE) */
//   const handleSubmit = async () => {
//     if (!validateFields()) return;

//     const payload = {
//       title: form.title,
//       description: form.description,
//       thumbnail: thumbnailUrl,
//       price: Number(form.price),
//       duration: 600, // Default duration
//       level: "BEGINNER",
//       faculty,
//     };

//     try {
//       if (currentCourse) {
//         // 🔥 UPDATE MODE
//         await updateCourse(payload); // Ensure updateCourse is exposed in store
//         onSuccess(currentCourse.id);
//       } else {
//         // 🔥 CREATE MODE
//         const courseId = await createCourse(payload);
//         onSuccess(courseId);
//       }
//     } catch (error) {
//       console.error("Failed to save course:", error);
//       alert("Failed to save. Please try again.");
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6">
//       <div className="bg-white w-full max-w-6xl rounded-xl shadow-lg p-4 sm:p-6 max-h-[95vh] flex flex-col">
//         <div className="flex-1 overflow-y-auto px-4 lg:px-6  ">
//           <h2 className="text-lg sm:text-xl font-semibold mb-6">
//             Create Course
//           </h2>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* LEFT SIDE SAME AS BEFORE */}
//             <div className="space-y-5 md:border-r border-[#a09f9f] md:pr-6">
//               <div>
//                 <label className="block font-medium mb-1">Course Title <span className="text-red-600">*</span></label>
//                 <input
//                   className="w-full border border-[#a09f9f] rounded-lg px-4 py-2  outline-gray-400"
//                   value={form.title}
//                   onChange={(e) => setForm({ ...form, title: e.target.value })}
//                 />
//                 {errors.title && (
//                   <p className="text-xs text-red-500 mt-1">{errors.title}</p>
//                 )}
//               </div>

//               <div>
//                 <label className="block font-medium mb-1">
//                   Course Description <span className="text-red-600">*</span>
//                 </label>
//                 <textarea
//                   rows={4}
//                   className="w-full border border-[#a09f9f] rounded-lg px-4 py-2  outline-gray-400"
//                   value={form.description}
//                   onChange={(e) =>
//                     setForm({ ...form, description: e.target.value })
//                   }
//                 />
//                 {errors.description && (
//                   <p className="text-xs text-red-500 mt-1">
//                     {errors.description}
//                   </p>
//                 )}
//               </div>

//               <label className="block font-medium mb-1">Thumbnail <span className="text-red-600">*</span></label>

//               <div className="border border-[#a09f9f] rounded-lg p-4">
//                 {/* Clickable Preview Area */}
//                 <div
//                   onClick={() =>
//                     document.getElementById("thumbnailInput").click()
//                   }
//                   className="relative w-full sm:w-60 h-32 rounded-md overflow-hidden cursor-pointer"
//                 >
//                   {thumbnailUrl ? (
//                     <img
//                       src={thumbnailUrl}
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 text-sm">
//                       <GrGallery size={40} />
//                       <span className="mt-2">Select File</span>
//                     </div>
//                   )}

//                   {thumbnailUploading && (
//                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
//                       <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
//                     </div>
//                   )}
//                 </div>

//                 {/* Upload Button */}
//                 <div className="mt-3">
//                   <button
//                     type="button"
//                     onClick={async () => {
//                       if (!selectedThumbnailFile) return;
//                       await handleThumbnailUpload(selectedThumbnailFile);
//                       setSelectedThumbnailFile(null);
//                     }}
//                     className={`px-5 text-sm transition text-[12px] border px-2.5 py-0.5 text-[#37af47]  rounded-[14px] disabled:opacity-60 flex justify-center items-center gap-[2px] ${
//                       selectedThumbnailFile
//                         ? "Uploading..."
//                         : "Upload"
//                     }`}
//                   >
//                       <MdOutlineFileUpload/>
                    
//                     Upload Thumbnail
//                   </button>
//                 </div>

//                 {/* Hidden Input */}
//                 <input
//                   id="thumbnailInput"
//                   type="file"
//                   hidden
//                   accept="image/*"
//                   onChange={(e) => {
//                     const file = e.target.files[0];
//                     if (file) {
//                       setSelectedThumbnailFile(file);
//                     }
//                   }}
//                 />
//               </div>

//               {errors.thumbnail && (
//                 <p className="text-xs text-red-500 mt-1">{errors.thumbnail}</p>
//               )}
//             </div>

//             {/* RIGHT SIDE */}
//             <div>
//               <h3 className="font-semibold ">Faculty info <span className="text-red-600">*</span></h3>
//               {errors.faculty && (
//                 <p className="text-xs text-red-500 ">{errors.faculty}</p>
//               )}

//               <div className="border border-[#a09f9f] rounded-lg p-4 h-[250px] mb-4 mt-2 flex flex-wrap gap-4">
//                 {/* Faculty List */}
//                 {faculty.map((f, index) => (
//                   <div key={index} className="relative text-center">
//                     {f.imageUrl ? (
//                       <img
//                         src={f.imageUrl}
//                         className="w-14 h-14 rounded-full object-cover"
//                       />
//                     ) : (
//                       <MdAccountCircle size={50} className="text-gray-400" />
//                     )}

//                     <button
//                       onClick={() => removeFaculty(index)}
//                       className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"
//                     >
//                       <X size={12} />
//                     </button>
//                     <p className="text-xs mt-1 font-medium ">{f.name}</p>
//                     <p className="text-[10px] text-gray-500">
//                       {f.qualification}
//                     </p>
//                   </div>
//                 ))}

//                 {/* Add Faculty Section */}
//                 <div className="w-full">
//                   <div className="flex flex-col sm:flex-row gap-3 items-center mt-4 px-6 md:px-0 lg:px-2.5">
//                     <div className="grid gap-3 w-full sm:w-[300px]">
//                       <input
//                         placeholder="John David"
//                         className="border border-[#a09f9f] rounded-lg  outline-gray-400 px-3 py-2 text-sm"
//                         value={draftFaculty.name}
//                         onChange={(e) =>
//                           setDraftFaculty({
//                             ...draftFaculty,
//                             name: e.target.value,
//                           })
//                         }
//                       />

//                       <input
//                         placeholder="M.com, CAIIB"
//                         className="border border-[#a09f9f]  outline-gray-400 rounded-lg px-3 py-2 text-sm"
//                         value={draftFaculty.qualification}
//                         onChange={(e) =>
//                           setDraftFaculty({
//                             ...draftFaculty,
//                             qualification: e.target.value,
//                           })
//                         }
//                       />
//                     </div>

//                     {/* PROFILE ICON FIXED */}
//                     <div
//                       onClick={() => fileInputRef.current.click()}
//                       className="w-18 h-18 rounded-full flex items-center justify-center cursor-pointer overflow-hidden "
//                     >
//                       {draftFaculty.imageUrl ? (
//                         <img
//                           src={draftFaculty.imageUrl}
//                           className="w-full h-full object-fill"
//                         />
//                       ) : (
//                         <MdAccountCircle size={100} className="text-gray-400" />
//                       )}
//                     </div>

//                     <input
//                       ref={fileInputRef}
//                       type="file"
//                       hidden
//                       accept="image/*"
//                       onChange={(e) =>  uploadFacultyImage(e.target.files[0])} 
//                     />

//                     <button
//                       onClick={addFaculty}
//                       disabled={facultyUploading}
//                       className="text-sm mt-1 flex justify-center items-center text-[12px] border-b  py-0.5 text-[#37af47]  disabled:opacity-60 "
//                     >
//                                                         <MdOutlineFileUpload/>Upload
//            </button>
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-32">
//                 <label className="font-medium ">Total Amount <span className="text-red-600">*</span></label>
//                 <input
//                   className="w-full mt-1 border-[#a09f9f] border  outline-gray-400 rounded-lg px-4 py-2 bg-gray-50"
//                   type="number"
//                   value={form.price}
//                   onChange={(e) => setForm({ ...form, price: e.target.value })}
//                 />
//               </div>
//             </div>
//           </div>
//           <div></div>

//           {/* FOOTER */}
//           <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
//             <button
//               onClick={onCancel}
//               className="px-10 py-2 rounded-lg bg-gray-400 text-white"
//             >
//               Cancel
//             </button>

//             <button
//               onClick={handleSubmit}
//               disabled={loading || thumbnailUploading}
//               className="px-10 py-2 rounded-lg bg-gray-600 text-white flex items-center justify-center gap-2"
//             >
//               {loading ? (
//                 <>
//                   <div className="" />
//                   Saving...
//                 </>
//               ) : (
//                 "Save & Continue"
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

//components/CreateCourse.jsx
"use client";
import { useState, useRef, useEffect } from "react";
import useCourseStore from "@/store/useCourseStore";
import { X } from "lucide-react";
import { uploadImageToCloudinary } from "../../../src/utils/cloudinaryImageUpload";
import { MdAccountCircle } from "react-icons/md";
import { GrGallery } from "react-icons/gr";
import { MdOutlineFileUpload } from "react-icons/md";
import toast from "react-hot-toast";

export default function CreateCourse({ onCancel, onSuccess }) {
  const { createCourse, loading, currentCourse, updateCourse, courses } =
    useCourseStore();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    thumbnail: "",
    faculty: [],
  });

  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState(null);

  const [errors, setErrors] = useState({});
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [facultyUploading, setFacultyUploading] = useState(false);
  const [faculty, setFaculty] = useState([]);

  const [draftFaculty, setDraftFaculty] = useState({
    name: "",
    qualification: "",
    imageUrl: "",
  });
const anyUploading = thumbnailUploading || facultyUploading;
  useEffect(() => {
    if (currentCourse) {
      console.log(`Current course details : ${JSON.stringify(currentCourse)}`);
      setForm({
        title: currentCourse.title || "",
        description: currentCourse.description || "",
        price: currentCourse.price || "",
      });

      setThumbnailUrl(currentCourse.thumbnail || "");
      setFaculty(currentCourse.faculty || []);
    } else {
      setForm({
        title: "",
        description: "",
        price: "",
      });
      setThumbnailUrl("");
      setFaculty([]);
    }
  }, [currentCourse]);

  const handleThumbnailUpload = async (file) => {
    if (!file) return;
    setThumbnailUploading(true);
    try {
      const url = await uploadImageToCloudinary(file, "COURSE_THUMBNAIL");
      setThumbnailUrl(url);
      setErrors((p) => ({ ...p, thumbnail: "" }));
    } finally {
      setThumbnailUploading(false);
    }
  };

  const uploadFacultyImage = async (file) => {
    if (!file) return;
    setFacultyUploading(true);
    try {
      const url = await uploadImageToCloudinary(file, "FACULTY_IMAGE");
      setDraftFaculty((prev) => ({ ...prev, imageUrl: url }));
      toast.success("Image uploaded successfully");
    } finally {
      setFacultyUploading(false);
    }
  };

  const addFaculty = () => {
    const newErrors = {};

    const trimmedName = draftFaculty.name.trim();
    if (!trimmedName) {
      newErrors.facultyName = "This field is mandatory";
    } else if (!/^[A-Za-z][A-Za-z .'\-]*$/.test(trimmedName)) {
      newErrors.facultyName =
        "Name can only contain letters, spaces, apostrophes, hyphens, and dots";
    }

    if (!draftFaculty.qualification.trim()) {
      newErrors.facultyQualification = "This field is mandatory";
    }

    if (Object.keys(newErrors).length) {
      setErrors((p) => ({ ...p, ...newErrors }));
      return;
    }

    setFaculty([...faculty, draftFaculty]);

    toast.success("Faculty added successfully 🎉");

    setDraftFaculty({ name: "", qualification: "", imageUrl: "" });

    setErrors((p) => ({
      ...p,
      faculty: "",
      facultyName: "",
      facultyQualification: "",
    }));
  };

  const removeFaculty = (index) => {
    setFaculty(faculty.filter((_, i) => i !== index));
  };

  const validateFields = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "This field is required";
    if (!form.description.trim())
      newErrors.description = "This field is required";
    if (!thumbnailUrl) newErrors.thumbnail = "This field is required";
    if (!form.price) newErrors.price = "This field is required";
    if (faculty.length === 0) newErrors.faculty = "This field is required";

    if (!newErrors.title) {
      const trimmedTitle = form.title.trim().toLowerCase();
      const duplicate = (courses || []).some(
        (c) =>
          c?.id !== currentCourse?.id &&
          (c?.title || "").trim().toLowerCase() === trimmedTitle,
      );
      if (duplicate) {
        newErrors.title = "A course with this title already exists";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;

    const payload = {
      title: form.title,
      description: form.description,
      thumbnail: thumbnailUrl,
      price: Number(form.price),
      duration: 600,
      level: "BEGINNER",
      faculty,
    };

    try {
      if (currentCourse) {
        await updateCourse(payload);
        onSuccess(currentCourse.id);
      } else {
        const courseId = await createCourse(payload);
        onSuccess(courseId);
      }
    } catch (error) {
      console.error("Failed to save course:", error);
      alert("Failed to save. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-6xl rounded-xl shadow-lg p-4 sm:p-6 max-h-[95vh] flex flex-col">
        <div className="flex-1 overflow-y-auto px-4 lg:px-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-6">
            Create Course
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-5 md:border-r border-[#a09f9f] md:pr-6">
              <div>
                <label className="block font-medium mb-1">Course Title <span className="text-red-600">*</span></label>
                <input
                  className="w-full border border-[#a09f9f] rounded-lg px-4 py-2 outline-gray-400"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                {errors.title && (
                  <p className="text-xs text-red-500 mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block font-medium mb-1">
                  Course Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={4}
                  className="w-full border border-[#a09f9f] rounded-lg px-4 py-2 outline-gray-400"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
                {errors.description && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              <label className="block font-medium mb-1">Thumbnail <span className="text-red-600">*</span></label>

              <div className="border border-[#a09f9f] rounded-lg p-4">
              <div
  onClick={() => {
    if (facultyUploading) return;
    document.getElementById("thumbnailInput").click();
  }}
  className={`relative w-full sm:w-60 h-32 rounded-md overflow-hidden ${
    facultyUploading ? "cursor-not-allowed opacity-60" : "cursor-pointer"
  }`}
>
                  {thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      className="w-full h-full object-cover"
                    />
                  ) : selectedThumbnailFile ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-600 text-sm px-2 text-center">
                      <GrGallery size={30} />
                      <span className="mt-2 font-medium break-all">
                        {selectedThumbnailFile.name}
                      </span>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 text-sm">
                      <GrGallery size={40} />
                      <span className="mt-2">Select File</span>
                    </div>
                  )}

                  {thumbnailUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <div className="mt-3">
  <button
    type="button"
    disabled={!selectedThumbnailFile || thumbnailUploading || facultyUploading}
    onClick={async () => {
      if (!selectedThumbnailFile) return;
      await handleThumbnailUpload(selectedThumbnailFile);
      setSelectedThumbnailFile(null);
    }}
    className={`px-4 py-1.5 text-xs rounded-[14px] flex items-center gap-1 border transition ${
      selectedThumbnailFile && !facultyUploading
        ? "text-[#37af47] border-[#37af47] hover:bg-green-50"
        : "text-gray-400 border-gray-300 cursor-not-allowed"
    }`}
  >
    <MdOutlineFileUpload />
    {thumbnailUploading ? "Uploading..." : "Upload"}
  </button>
</div>

                <input
  id="thumbnailInput"
  type="file"
  hidden
  accept="image/*"
  onChange={(e) => {
    if (facultyUploading) return;
    const file = e.target.files[0];
    if (file) setSelectedThumbnailFile(file);
  }}
/>
              </div>

              {errors.thumbnail && (
                <p className="text-xs text-red-500 mt-1">{errors.thumbnail}</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold">Faculty info <span className="text-red-600">*</span></h3>
              {errors.faculty && (
                <p className="text-xs text-red-500">{errors.faculty}</p>
              )}

              <div className="border border-[#a09f9f] rounded-lg p-4 h-[250px] mb-4 mt-2 flex flex-wrap gap-4">
                {faculty.map((f, index) => (
                  <div key={index} className="relative text-center">
                    {f.imageUrl ? (
                      <img
                        src={f.imageUrl}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <MdAccountCircle size={50} className="text-gray-400" />
                    )}

                    <button
                      onClick={() => removeFaculty(index)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={12} />
                    </button>
                    <p className="text-xs mt-1 font-medium">{f.name}</p>
                    <p className="text-[10px] text-gray-500">
                      {f.qualification}
                    </p>
                  </div>
                ))}

                <div className="w-full">
                  <div className="flex flex-col sm:flex-row gap-3 items-center mt-4 px-6 md:px-0 lg:px-2.5">

                    <div className="relative w-20 h-20 rounded-full overflow-hidden border border-[#a09f9f] bg-gray-50 flex items-center justify-center">
                      {draftFaculty.imageUrl ? (
                        <img
                          src={draftFaculty.imageUrl}
                          alt="Faculty"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <MdAccountCircle size={90} className="text-gray-400" />
                      )}

                      {facultyUploading && (
                        <div className="absolute inset-0 bg-black/45 flex items-center justify-center z-20">
                          <div className="w-7 h-7 border-4 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}

                     {!facultyUploading && (
  <button
    type="button"
    onClick={() => {
      if (thumbnailUploading) return;
      fileInputRef.current?.click();
    }}
    disabled={thumbnailUploading}
    className="absolute bottom-1 left-1/2 -translate-x-1/2 z-10 text-[8px] px-1 py-1 rounded-full bg-white/95 border border-gray-300 text-[#37af47] shadow-sm hover:bg-green-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {draftFaculty.imageUrl ? "Change Image" : "Select Image"}
  </button>
)}
                    </div>

                   <input
  ref={fileInputRef}
  type="file"
  hidden
  accept="image/*"
  onChange={(e) => {
    if (thumbnailUploading) return;
    uploadFacultyImage(e.target.files[0]);
  }}
/>
                                        <div className="grid gap-3 w-full sm:w-[300px]">
                      <div>
                      <input
                        placeholder="John David"
                        className="border border-[#a09f9f] rounded-lg outline-gray-400 px-3 py-2 text-sm w-full"
                        value={draftFaculty.name}
                        onChange={(e) =>
                          setDraftFaculty({
                            ...draftFaculty,
                            name: e.target.value,
                          })
                        }
                      />
                      {errors.facultyName && (
                        <p className="text-xs text-red-500 mt-1">{errors.facultyName}</p>
                      )}
                      </div>

                      <input
                        placeholder="M.com, CAIIB"
                        className="border border-[#a09f9f] outline-gray-400 rounded-lg px-3 py-2 text-sm"
                        value={draftFaculty.qualification}
                        onChange={(e) =>
                          setDraftFaculty({
                            ...draftFaculty,
                            qualification: e.target.value,
                          })
                        }
                      />
                    </div>


                    <button
  onClick={addFaculty}
  disabled={anyUploading}
  className="text-[15px] mt-1 flex justify-center items-center font-medium border px-4 rounded-xl py-1 text-[#37af47] disabled:opacity-60 disabled:cursor-not-allowed"
>
  <MdOutlineFileUpload className="font-medium text-[18px]" />
  Add
</button>
                  </div>
                </div>
              </div>

              <div className="mt-32">
                <label className="font-medium">Total Amount <span className="text-red-600">*</span></label>
                <input
                  className="w-full mt-1 border-[#a09f9f] border outline-gray-400 rounded-lg px-4 py-2 bg-gray-50"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
            <button
              onClick={onCancel}
              className="px-10 py-2 rounded-lg bg-gray-400 text-white"
            >
              Cancel
            </button>

           <button
  onClick={handleSubmit}
  disabled={loading || anyUploading}
  className="px-10 py-2 rounded-lg bg-gray-600 text-white flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
>
  {loading ? "Saving..." : "Save & Continue"}
</button>
          </div>
        </div>
      </div>
    </div>
  );
}

