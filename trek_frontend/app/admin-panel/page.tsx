"use client";

import { useEffect, useState } from "react";

interface DashboardStats {
  users: {
    total: number;
    travellers: number;
    guides: number;
    agencies: number;
    sellers: number;
  };
  treks: {
    total: number;
    active: number;
    draft: number;
  };
  tours: {
    total: number;
    active: number;
  };
  gear: {
    total: number;
    active: number;
  };
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
  };
  revenue: {
    total: number;
  };
  reviews: {
    total: number;
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] =
    useState<DashboardStats | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token =
        localStorage.getItem("access");

      const response = await fetch(
        "http://127.0.0.1:8000/api/account/admin/stats/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      setStats(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        Loading dashboard...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        Failed to load dashboard.
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <Card
          title="Users"
          value={stats.users.total}
        />

        <Card
          title="Treks"
          value={stats.treks.total}
        />

        <Card
          title="Tours"
          value={stats.tours.total}
        />

        <Card
          title="Gear"
          value={stats.gear.total}
        />

        <Card
          title="Bookings"
          value={stats.bookings.total}
        />

        <Card
          title="Reviews"
          value={stats.reviews.total}
        />

        <Card
          title="Revenue"
          value={`Rs ${stats.revenue.total}`}
        />

        <Card
          title="Active Treks"
          value={stats.treks.active}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-10">
        <div className="border rounded-lg p-5">
          <h2 className="font-bold text-lg mb-4">
            User Breakdown
          </h2>

          <ul className="space-y-2">
            <li>
              Travellers:
              {" "}
              {stats.users.travellers}
            </li>

            <li>
              Guides:
              {" "}
              {stats.users.guides}
            </li>

            <li>
              Agencies:
              {" "}
              {stats.users.agencies}
            </li>

            <li>
              Sellers:
              {" "}
              {stats.users.sellers}
            </li>
          </ul>
        </div>

        <div className="border rounded-lg p-5">
          <h2 className="font-bold text-lg mb-4">
            Booking Status
          </h2>

          <ul className="space-y-2">
            <li>
              Pending:
              {" "}
              {stats.bookings.pending}
            </li>

            <li>
              Confirmed:
              {" "}
              {stats.bookings.confirmed}
            </li>

            <li>
              Completed:
              {" "}
              {stats.bookings.completed}
            </li>

            <li>
              Cancelled:
              {" "}
              {stats.bookings.cancelled}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="border rounded-lg p-5 shadow-sm">
      <p className="text-gray-500">
        {title}
      </p>

      <h3 className="text-3xl font-bold mt-2">
        {value}
      </h3>
    </div>
  );
}