"use client";

import LayoutDashboard from "@/components/LayoutDashboard";

export default function TablesPage() {
  return (
    <LayoutDashboard>

      <h1 className="text-3xl pb-6">Tables</h1>

      {/* TABLA 1 */}
      <div className="mt-6">
        <p className="text-xl pb-3">Table Example</p>

        <div className="bg-white overflow-auto">
          <table className="min-w-full">
            <thead className="bg-[var(--color-secondary)] text-white">
              <tr>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Last name</th>
                <th className="py-3 px-4 text-left">Phone</th>
                <th className="py-3 px-4 text-left">Email</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="py-3 px-4">Lian</td>
                <td className="py-3 px-4">Smith</td>
                <td className="py-3 px-4">622322662</td>
                <td className="py-3 px-4">jonsmith@mail.com</td>
              </tr>

              <tr className="bg-gray-100">
                <td className="py-3 px-4">Emma</td>
                <td className="py-3 px-4">Johnson</td>
                <td className="py-3 px-4">622322662</td>
                <td className="py-3 px-4">jonsmith@mail.com</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* TABLA 2 */}
      <div className="mt-12">
        <p className="text-xl pb-3">Table Example</p>

        <div className="bg-white overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="py-4 px-6 border-b">Name</th>
                <th className="py-4 px-6 border-b">Last Name</th>
                <th className="py-4 px-6 border-b">Phone</th>
                <th className="py-4 px-6 border-b">Email</th>
              </tr>
            </thead>

            <tbody>
              <tr className="hover:bg-gray-100">
                <td className="py-4 px-6 border-b">Lian</td>
                <td className="py-4 px-6 border-b">Smith</td>
                <td className="py-4 px-6 border-b">622322662</td>
                <td className="py-4 px-6 border-b">jonsmith@mail.com</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* TABLA 3 */}
      <div className="mt-12">
        <p className="text-xl pb-3">Users</p>

        <div className="bg-white overflow-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-5 py-3 text-left">User</th>
                <th className="px-5 py-3 text-left">Rol</th>
                <th className="px-5 py-3 text-left">Created</th>
                <th className="px-5 py-3 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="px-5 py-5 flex items-center gap-3">
                  <img
                    className="w-10 h-10 rounded-full"
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
                    alt=""
                  />
                  Vera Carpenter
                </td>

                <td className="px-5 py-5">Admin</td>
                <td className="px-5 py-5">Jan 21, 2020</td>

                <td className="px-5 py-5">
                  <span className="bg-green-200 text-green-900 px-3 py-1 rounded-full">
                    Activo
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </LayoutDashboard>
  );
}