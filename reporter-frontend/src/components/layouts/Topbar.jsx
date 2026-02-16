
export default function Topbar() {
  return (
    <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
      
      <h1 className="text-xl font-semibold text-gray-800">
        Dashboard
      </h1>

      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search..."
          className="border rounded-lg px-3 py-1 text-sm"
        />

        <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
      </div>

    </div>
  );
}
