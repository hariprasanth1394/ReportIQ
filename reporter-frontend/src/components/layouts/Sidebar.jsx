
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 bg-gradient-to-b from-blue-700 to-blue-900 text-white flex flex-col">

      <div className="p-6 text-2xl font-bold">
        ReportIQ
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <NavLink
          to="/"
          className="block px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/runs"
          className="block px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Execution Runs
        </NavLink>

        <NavLink
          to="/analytics"
          className="block px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Analytics
        </NavLink>

        <NavLink
          to="/users"
          className="block px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Users
        </NavLink>
      </nav>

      <div className="p-4 border-t border-blue-600">
        <button className="w-full bg-blue-600 hover:bg-blue-500 rounded-lg py-2 transition">
          Logout
        </button>
      </div>
    </div>
  );
}
