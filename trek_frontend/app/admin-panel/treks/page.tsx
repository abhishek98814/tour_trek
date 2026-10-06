"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function TreksPage() {
  const [treks, setTreks] = useState([]);

  useEffect(() => {
    fetchTreks();
  }, []);

  const fetchTreks = async () => {
    const token = localStorage.getItem("access");

    const res = await fetch(
      "http://127.0.0.1:8000/api/treks/",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    setTreks(data);
  };

  return (
    <div>
      <div className="flex justify-between mb-5">
        <h1 className="text-2xl font-bold">Treks</h1>

        <Link
          href="/admin-panel/treks/new"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Trek
        </Link>
      </div>

      <table className="w-full border">
        <thead>
          <tr>
            <th>Title</th>
            <th>Region</th>
            <th>Difficulty</th>
            <th>Status</th>
            <th>Price</th>
          </tr>
        </thead>

        <tbody>
          {treks.map((trek: any) => (
            <tr key={trek.id}>
              <td>{trek.title}</td>
              <td>{trek.region}</td>
              <td>{trek.difficulty}</td>
              <td>{trek.status}</td>
              <td>${trek.price_per_person}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}