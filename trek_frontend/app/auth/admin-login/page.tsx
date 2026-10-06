"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
    //   const response = await fetch(
    //     "http://127.0.0.1:8000/api/token/",
    //     {
    //       method: "POST",
    //       headers: {
    //         "Content-Type":
    //           "application/json",
    //       },
    //       body: JSON.stringify({
    //         username,
    //         password,
    //       }),
    //     }
    //   );

    const response = await fetch(
  "http://127.0.0.1:8000/api/auth/login/",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  }
);
      const data = await response.json();

      if (!response.ok) {
        setError("Invalid credentials");
        setLoading(false);
        return;
      }

      localStorage.setItem(
        "access",
        data.access
      );

      localStorage.setItem(
        "refresh",
        data.refresh
      );

      const profileRes = await fetch(
        // "http://127.0.0.1:8000/api/account/profile/",
            "http://127.0.0.1:8000/api/auth/profile/",
        {
          headers: {
            Authorization: `Bearer ${data.access}`,
          },
        }
      );

      const user =
        await profileRes.json();

      if (user.role !== "admin") {
        localStorage.removeItem(
          "access"
        );

        localStorage.removeItem(
          "refresh"
        );

        setError(
          "Only admins can access dashboard"
        );

        setLoading(false);
        return;
      }

      router.push("/admin-panel");
    } catch (err) {
      setError("Login failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold text-center mb-6">
          Admin Login
        </h1>

        {error && (
          <div className="mb-4 text-red-500">
            {error}
          </div>
        )}

        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(
                e.target.value
              )
            }
            className="w-full border p-3 rounded"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            className="w-full border p-3 rounded"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded"
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}