"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      const token = localStorage.getItem("access");

      if (!token) {
        router.push("/auth/admin-login");
        return;
      }

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/account/profile/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          router.push("/auth/admin-login");
          return;
        }

        const user = await response.json();

        if (user.role !== "admin") {
          router.push("/");
          return;
        }

        setLoading(false);
      } catch (error) {
        router.push("/auth/admin-login");
      }
    };

    verifyAdmin();
  }, [router]);

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    router.push("/auth/admin-login");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading Admin Panel...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-gray-50 p-4">
        <h2 className="mb-6 text-2xl font-bold">
          Admin Panel
        </h2>

        <nav className="space-y-4">
          <Link
            href="/admin-panel"
            className="block"
          >
            Dashboard
          </Link>

          <Link
            href="/admin-panel/treks"
            className="block"
          >
            Treks
          </Link>

          <Link
            href="/admin-panel/tours"
            className="block"
          >
            Tours
          </Link>

          <Link
            href="/admin-panel/bookings"
            className="block"
          >
            Bookings
          </Link>

          <Link
            href="/admin-panel/users"
            className="block"
          >
            Users
          </Link>

          <Link
            href="/admin-panel/review"
            className="block"
          >
            Reviews
          </Link>

          <Link
            href="/admin-panel/gear"
            className="block"
          >
            Gear
          </Link>
        </nav>

        <button
          onClick={logout}
          className="mt-10 w-full rounded bg-red-600 px-4 py-2 text-white"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}