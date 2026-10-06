"use client";

export default function Loader() {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
        <p className="text-sm text-gray-600">
          Loading adventures...
        </p>
      </div>
    </div>
  );
}