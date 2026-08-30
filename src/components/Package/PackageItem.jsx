"use client";
import { useEffect, useState } from "react";
import {
  IoIosArrowForward,
  IoIosArrowDown,
  IoMdAddCircle,
} from "react-icons/io";
import useCategoryStore from "@/store/categoryStore";
import EditPackage from "./EditPackage";
import DeletePackage from "./DeletePackage";
import { MdEditNote } from "react-icons/md";
import { RiDeleteBin5Line } from "react-icons/ri";


export default function PackageItem() {
  const {
    categories,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategoryStore();

  const [subName, setSubName] = useState("");
  const [selectedParent, setSelectedParent] = useState(null);
  const [selectedEdit, setSelectedEdit] = useState(null);
  const [selectedDelete, setSelectedDelete] = useState(null);
    const [showInput, setShowInput] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
  
  const [openIds, setOpenIds] = useState({});

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const toggleOpen = (id) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddOrEdit = async () => {
    if (!subName.trim()) return;

    if (selectedEdit) {
      await updateCategory(selectedEdit.id, { name: subName });
    } else if (selectedParent) {
      await createCategory({
        name: subName,
        parentId: selectedParent.id,
      });
    }

    setSubName("");
    setSelectedEdit(null);
    setSelectedParent(null);
    setShowInput(false);
  };

  const handleDelete = async () => {
    if (!selectedDelete) return;
    await deleteCategory(selectedDelete.id);
    setSelectedDelete(null);
    setShowDelete(false);
  };

  // 🔁 Recursive renderer
  const renderCategory = (category, level = 0) => {
    const isOpen = openIds[category.id];
    const hasChildren = category.children?.length > 0;

const cardStyle =
  level === 0
    ? "bg-[#A9BEE2] border border-[#8BA8D4] shadow-[0_2px_6px_rgba(139,168,212,0.12)]"
    : "bg-[#E3EAF8] border border-[#A9BEE2] shadow-[0_2px_5px_rgba(169,190,226,0.12)]";

    return (
      <div key={category.id} className="mt-4 ">
        {/* CARD */}
        <div
          className={`${cardStyle} px-5 py-3 rounded-xl w-[70%]
          flex justify-between items-center cursor-pointer
          hover:brightness-105 transition-all duration-200 `}
          style={{ marginLeft: level * 40 }}
        >
          {/* LEFT */}
          <div
            className="flex items-center gap-2"
            onClick={() => hasChildren && toggleOpen(category.id)}
          >
            {hasChildren && (
              <span className="text-[18px] font-bold">
                {isOpen ? <IoIosArrowDown /> : <IoIosArrowForward />}
              </span>
            )}

            <div>
              <p className="text-[12px]">
                {level === 0 ? "Package name" : "Sub package name"}
              </p>
              <p className="text-[18px] font-semibold me-4">{category.name}</p>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2 xl:gap-5 items-center">
            {/* ADD */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedParent(category);
                setSelectedEdit(null);
                setSubName("");
                setShowInput(true);
              }}
              className="
                flex items-center gap-1 underline underline-offset-4
                 text-[15px]
                hover:text-[#555555] hover:scale-105
                transition-all duration-200 w-[160px]
              "
            >
              <IoMdAddCircle className="text-[22px]" />
              Add Sub package
            </button>

            {/* EDIT */}
            <MdEditNote
              className="
                text-[28px] cursor-pointer
                hover:text-[#555555] hover:scale-110
                transition-all duration-200
              "
              onClick={(e) => {
                e.stopPropagation();
                setSelectedEdit(category);
                setSelectedParent(null);
                setSubName(category.name);
                setShowInput(true);
              }}
            />

            {/* DELETE */}
            <RiDeleteBin5Line
              className="
                text-[22px] cursor-pointer
                hover:text-[#555555] hover:scale-110
                transition-all duration-200
              "
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDelete(category);
                setShowDelete(true);
              }}
            />
          </div>
        </div>

        {/* CHILDREN */}
        {isOpen &&
          category.children?.map((child) => renderCategory(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="py-2  space-y-4">
      {categories.map((category) => renderCategory(category))}
        {showInput && (selectedParent || selectedEdit) && (
<EditPackage className=""
  isOpen={showInput && (selectedParent || selectedEdit)}
  isEdit={!!selectedEdit}
  value={subName}
  title={

    selectedEdit
      ? `Edit ${selectedEdit.name}`
      : `Create new package for  ${selectedParent?.name} `
    
  }
  onChange={setSubName}
  onCancel={() => {
    setShowInput(false);
    setSelectedParent(null);
    setSelectedEdit(null);
    setSubName("");
  }}
  onSubmit={handleAddOrEdit}
/>

      )}
          {showDelete && selectedDelete && (
<DeletePackage
  isOpen={showDelete}
  item={selectedDelete}
  onCancel={() => setShowDelete(false)}
  onConfirm={handleDelete}
/>

      )}
    </div>
  );
}









// "use client";
// import { useState } from "react";
// import {
//   IoIosArrowForward,
//   IoIosArrowDown,
//   IoMdAddCircle,
// } from "react-icons/io";
// import { RiDeleteBin5Fill } from "react-icons/ri";
// import { BiSolidEdit } from "react-icons/bi";
// import EditPackage from "./EditPackage";
// import DeletePackage from "./DeletePackage";

// export default function PackageItem() {
//   // UI STATES
//   const [openIds, setOpenIds] = useState({});
//   const [showInput, setShowInput] = useState(false);
//   const [showDelete, setShowDelete] = useState(false);

//   const [subName, setSubName] = useState("");
//   const [selectedParent, setSelectedParent] = useState(null);
//   const [selectedEdit, setSelectedEdit] = useState(null);
//   const [selectedDelete, setSelectedDelete] = useState(null);

//   // TEMP UI DATA
//   const categories = [
//     {
//       id: 1,
//       name: "Package A",
//       children: [
//         { id: 11, name: "Sub Package A1", children: [] },
//       ],
//     },
//     {
//       id: 2,
//       name: "Package B",
//       children: [],
//     },
//   ];

//   const toggleOpen = (id) => {
//     setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
//   };

//   const renderCategory = (category, level = 0) => {
//     const isOpen = openIds[category.id];
//     const hasChildren = category.children?.length > 0;

//     // const bgColor =
//     //   level === 0 ? "bg-[#C7E6ED]" : "bg-[#D6D8FF]";

//   //   const bgColor =
//   // level === 0
//   //   ? "bg-[#A9BEE2]"
//   //   : "bg-[#E3EAF8]";

// // const cardStyle =
// //   level === 0
// //     ? "bg-[#A9BEE2] border border-[#8BA8D4] shadow-[0_8px_20px_rgba(139,168,212,0.35)]"
// //     : "bg-[#E3EAF8] border border-[#A9BEE2] shadow-[0_6px_16px_rgba(169,190,226,0.35)]";
// const cardStyle =
//   level === 0
//     ? "bg-[#A9BEE2] border border-[#8BA8D4] shadow-[0_2px_6px_rgba(139,168,212,0.12)]"
//     : "bg-[#E3EAF8] border border-[#A9BEE2] shadow-[0_2px_5px_rgba(169,190,226,0.12)]";

//     return (
//       <div key={category.id} className="mt-4">
//         <div
//           className={`${cardStyle} px-5 py-3 rounded-xl w-[70%]
//           flex justify-between items-center cursor-pointer
//           hover:brightness-105 transition-all`}
//           style={{ marginLeft: level * 40 }}
//         >
//           {/* LEFT */}
//           <div
//             className="flex items-center gap-2"
//             onClick={() => hasChildren && toggleOpen(category.id)}
//           >
//             {hasChildren && (
//               <span className="text-[18px] font-bold">
//                 {isOpen ? <IoIosArrowDown /> : <IoIosArrowForward />}
//               </span>
//             )}

//             <div>
//               <p className="text-[12px]">
//                 {level === 0 ? "Package name" : "Sub package name"}
//               </p>
//               <p className="text-[18px] font-semibold">
//                 {category.name}
//               </p>
//             </div>
//           </div>

//           {/* ACTIONS */}
//           <div className="flex gap-5 items-center">
//             <button
//               onClick={() => {
//                 setSelectedParent(category);
//                 setSelectedEdit(null);
//                 setSubName("");
//                 setShowInput(true);
//               }}
//               className="flex items-center gap-1 underline text-[15px] cursor-pointer"
//             >
//               <IoMdAddCircle className="text-[22px] text-[#555555] hover:text-[#2F2F2F]
//     hover:scale-115
//     transition-all duration-200 ease-in-out" />
//               Add Sub package
//             </button>

//             <BiSolidEdit
//               className="text-[22px] cursor-pointer text-[#555555] hover:text-[#2F2F2F]
//     hover:scale-115
//     transition-all duration-200 ease-in-out"
//               onClick={() => {
//                 setSelectedEdit(category);
//                 setSelectedParent(null);
//                 setSubName(category.name);
//                 setShowInput(true);
//               }}
//             />

//             <RiDeleteBin5Fill
//               className="text-[22px] cursor-pointer text-[#555555]     hover:text-[#2F2F2F]
//     hover:scale-115
//     transition-all duration-200 ease-in-out
// "
//               onClick={() => {
//                 setSelectedDelete(category);
//                 setShowDelete(true);
//               }}
//             />
//           </div>
//         </div>

//         {/* CHILDREN */}
//         {isOpen &&
//           category.children?.map((child) =>
//             renderCategory(child, level + 1)
//           )}
//       </div>
//     );
//   };

//   return (
//     <div className="p-6 space-y-4">
//       {categories.map((cat) => renderCategory(cat))}

//       {/* ADD / EDIT MODAL */}
//       {showInput && (
//         <EditPackage
//           isOpen={showInput}
//           isEdit={!!selectedEdit}
//           value={subName}
//           title={
//             selectedEdit
//               ? `Edit ${selectedEdit.name}`
//               : `Create new package`
//           }
//           onChange={setSubName}
//           onCancel={() => {
//             setShowInput(false);
//             setSelectedEdit(null);
//             setSelectedParent(null);
//             setSubName("");
//           }}
//           onSubmit={() => setShowInput(false)}
//         />
//       )}

//       {/* DELETE MODAL */}
//       {showDelete && (
//         <DeletePackage
//           isOpen={showDelete}
//           item={selectedDelete}
//           onCancel={() => setShowDelete(false)}
//           onConfirm={() => setShowDelete(false)}
//         />
//       )}
//     </div>
//   );
// }
