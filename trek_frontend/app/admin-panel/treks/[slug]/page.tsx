"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditTrekPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    fetchTrek();
  }, []);

  const fetchTrek = async () => {
    const token = localStorage.getItem("access");

    const res = await fetch(
      `http://127.0.0.1:8000/api/treks/${slug}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    setFormData({
      title: data.title,
      slug: data.slug,
      description: data.description,
      difficulty: data.difficulty,
      duration_days: data.duration_days,
      max_altitude: data.max_altitude,
      price_per_person: data.price_per_person,
      region: data.region,
      start_point: data.start_point,
      end_point: data.end_point,
      status: data.status,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const updateTrek = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const token = localStorage.getItem("access");

    await fetch(
      `http://127.0.0.1:8000/api/treks/${slug}/edit/`,
      {
        method: "PUT",
        headers: {
          "Content-Type":
            "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      }
    );

    router.push("/admin-panel/treks");
  };

  const deleteTrek = async () => {
    const token = localStorage.getItem("access");

    if (
      !confirm(
        "Delete this trek?"
      )
    )
      return;

    await fetch(
      `http://127.0.0.1:8000/api/treks/${slug}/edit/`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    router.push("/admin-panel/treks");
  };

  if (!formData) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        Edit Trek
      </h1>

      <form
        onSubmit={updateTrek}
        className="space-y-4"
      >
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <input
          name="region"
          value={formData.region}
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <input
          name="price_per_person"
          value={formData.price_per_person}
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <button
          type="submit"
          className="bg-green-600 text-white px-5 py-2 rounded"
        >
          Update
        </button>

        <button
          type="button"
          onClick={deleteTrek}
          className="bg-red-600 text-white px-5 py-2 rounded ml-3"
        >
          Delete
        </button>
      </form>
    </div>
  );
}