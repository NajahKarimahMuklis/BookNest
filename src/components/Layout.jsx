import React from "react";
import { Link } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-6">
        <h2 className="text-2xl font-semibold mb-6">Dashboard</h2>
        <ul>
          <li>
            <Link
              to="/dashboard"
              className="block py-2 px-4 rounded hover:bg-gray-700"
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/buku"
              className="block py-2 px-4 rounded hover:bg-gray-700"
            >
              Buku
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/kategori"
              className="block py-2 px-4 rounded hover:bg-gray-700"
            >
              Kategori
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/logout"
              className="block py-2 px-4 rounded hover:bg-gray-700"
            >
              Logout
            </Link>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">{children}</div>
    </div>
  );
}
