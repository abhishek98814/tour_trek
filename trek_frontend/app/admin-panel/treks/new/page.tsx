"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTrekPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    difficulty: "easy",
    duration_days: "",
    max_altitude: "",
    price_per_person: "",
    region: "",
    start_point: "",
    end_point: "",
    best_season: "autumn",
    status: "draft",
    tims_required: true,
    category: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const token =
      localStorage.getItem("access");

    const response = await fetch(
      "http://127.0.0.1:8000/api/treks/create/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      }
    );

    if (response.ok) {
      router.push("/admin-panel/treks");
    } else {
      console.log(await response.json());
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">
        Create Trek
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <input
          name="title"
          placeholder="Title"
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <input
          name="slug"
          placeholder="Slug"
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <textarea
          name="description"
          placeholder="Description"
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <input
          name="region"
          placeholder="Region"
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <input
          name="start_point"
          placeholder="Start Point"
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <input
          name="end_point"
          placeholder="End Point"
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <input
          name="duration_days"
          type="number"
          placeholder="Duration Days"
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <input
          name="max_altitude"
          type="number"
          placeholder="Max Altitude"
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <input
          name="price_per_person"
          type="number"
          placeholder="Price"
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <select
          name="difficulty"
          onChange={handleChange}
          className="border p-2 w-full"
        >
          <option value="easy">Easy</option>
          <option value="moderate">
            Moderate
          </option>
          <option value="difficult">
            Difficult
          </option>
          <option value="extreme">
            Extreme
          </option>
        </select>

        <select
          name="status"
          onChange={handleChange}
          className="border p-2 w-full"
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="inactive">
            Inactive
          </option>
        </select>

        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-2 rounded"
        >
          Save Trek
        </button>
      </form>
    </div>
  );
}