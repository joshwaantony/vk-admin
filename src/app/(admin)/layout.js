//app/admin/layout.js
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function layout({ children }) {
  return (
    <div className="h-screen grid grid-cols-[18rem_1fr] overflow-hidden">
      <Sidebar />
      <main className="bg-gray-50 overflow-y-auto">
        <Navbar />
        {children}
      </main>
    </div>
  );
}