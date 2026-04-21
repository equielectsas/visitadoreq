"use client";

import LayoutDashboard from "@/components/LayoutDashboard";

export default function FormsPage() {

  return (
    <LayoutDashboard>

      <h1 className="text-3xl text-black pb-6">Forms</h1>

      <div className="flex flex-wrap">

        {/* FORM 1 */}
        <div className="w-full lg:w-1/2 my-6 pr-0 lg:pr-2">
          <p className="text-xl pb-6">Contact Form</p>

          <form className="p-10 bg-white rounded shadow-xl space-y-4">

            <input
              className="w-full px-5 py-2 bg-gray-200 rounded"
              placeholder="Your Name"
            />

            <input
              className="w-full px-5 py-4 bg-gray-200 rounded"
              placeholder="Your Email"
            />

            <textarea
              className="w-full px-5 py-2 bg-gray-200 rounded"
              rows="6"
              placeholder="Your inquiry..."
            />

            <button className="px-4 py-1 text-white bg-[var(--color-secondary)] rounded">
              Submit
            </button>

          </form>
        </div>

        {/* FORM 2 */}
        <div className="w-full lg:w-1/2 mt-6 pl-0 lg:pl-2">
          <p className="text-xl pb-6">Checkout Form</p>

          <form className="p-10 bg-white rounded shadow-xl space-y-4">

            <input
              className="w-full px-5 py-2 bg-gray-200 rounded"
              placeholder="Name"
            />

            <input
              className="w-full px-5 py-4 bg-gray-200 rounded"
              placeholder="Email"
            />

            <input
              className="w-full px-2 py-2 bg-gray-200 rounded"
              placeholder="Address"
            />

            <input
              className="w-full px-2 py-2 bg-gray-200 rounded"
              placeholder="City"
            />

            <div className="flex gap-2">
              <input
                className="w-1/2 px-2 py-2 bg-gray-200 rounded"
                placeholder="Country"
              />
              <input
                className="w-1/2 px-2 py-2 bg-gray-200 rounded"
                placeholder="Zip"
              />
            </div>

            <input
              className="w-full px-2 py-2 bg-gray-200 rounded"
              placeholder="Card Number MM/YY CVC"
            />

            <button className="px-4 py-1 text-white bg-[var(--color-secondary)] rounded">
              $3.00
            </button>

          </form>
        </div>

      </div>

    </LayoutDashboard>
  );
}