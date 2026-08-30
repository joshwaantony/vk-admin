"use client";

import { useEffect, useState } from "react";
import useEnquiryStore from "@/store/EnquiryStore";

export default function EnquiriesPage() {
  const {
    enquiries,
    fetchEnquiries,
    changeStatus, // ✅ added
    page,
    totalPages,
  } = useEnquiryStore();

  const [selected, setSelected] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(""); // ✅ added
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchEnquiries({
      page: currentPage,
      limit: 20,
      status: filter,
      q: search,
    });
  }, [currentPage, filter, search]);

  useEffect(() => {
    if (enquiries.length > 0) {
      setSelected(enquiries[0]);
      setSelectedStatus(enquiries[0].status); // ✅ set status
    }
  }, [enquiries]);

  const handleSelect = (item) => {
    setSelected(item);
    setSelectedStatus(item.status);
  };

  const handleSave = async () => {
    if (!selected) return;

    await changeStatus(selected.id, selectedStatus);

    fetchEnquiries({
      page: currentPage,
      limit: 20,
      status: filter,
      q: search,
    });
  };

  return (
    <div className="p-6  bg-gray-100 min-h-screen">
      {/* Top Filter */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          className="border rounded-lg px-4 py-2 w-full"
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border rounded-lg px-4 py-2"
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="ALL">All</option>
          <option value="NEW">New</option>
          <option value="READ">Read</option>
          <option value="REPLIED">Replied</option>
        </select>

        <button
          onClick={() =>
            fetchEnquiries({
              page: currentPage,
              limit: 20,
              status: filter,
              q: search,
            })
          }
          className="bg-[#1F304A] text-white px-6 py-2 rounded-lg"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT LIST */}
        <div className="col-span-4 bg-white rounded-xl shadow">
          <div className="p-4 border-b font-semibold flex justify-between">
            <span>ENQUIRY LIST</span>
            <span className="text-sm text-gray-500">
              {enquiries.length} shown
            </span>
          </div>

          {enquiries.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                selected?.id === item.id ? "bg-gray-100" : ""
              }`}
            >
              <div className="flex justify-between">
                <p className="font-semibold">{item.fullName}</p>

                <span
                  className={`text-xs px-2 py-1 rounded ${
                    item.status === "NEW"
                      ? "bg-blue-100 text-blue-600"
                      : item.status === "READ"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-green-100 text-green-600"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <p className="text-sm text-gray-500">{item.email}</p>

              <p className="text-xs text-gray-400">{item.subject}</p>
            </div>
          ))}
        </div>

        {/* RIGHT DETAILS */}
        <div className="col-span-8 bg-white rounded-xl shadow p-6">
          {selected && (
            <>
              <h2 className="text-lg font-semibold mb-6">ENQUIRY DETAIL</h2>

              <div className="space-y-6">
                <div>
                  <p className="text-gray-500 text-sm">FULL NAME</p>
                  <p className="font-semibold">{selected.fullName}</p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">WORK EMAIL</p>
                  <p>{selected.email}</p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">SUBJECT</p>
                  <p>{selected.subject}</p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">MESSAGE</p>

                  <div className="bg-gray-100 rounded-lg p-4">
                    {selected.message}
                  </div>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">SUBMITTED AT</p>
                  <p>{new Date(selected.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </>
          )}

          {/* STATUS UPDATE */}

          {selected && (
            <div className="border-t pt-4 flex gap-4 mt-6">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border rounded-lg px-4 py-2"
              >
                <option value="NEW">NEW</option>
                <option value="READ">READ</option>
                <option value="REPLIED">REPLIED</option>
              </select>

              <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg"
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PAGINATION */}

      <div className="flex justify-center gap-3 mt-6">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Prev
        </button>

        <span className="px-4 py-2">
          Page {currentPage} / {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
