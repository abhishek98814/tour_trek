import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({
  message,
}: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
      <AlertCircle className="mt-0.5 h-5 w-5 text-red-500" />

      <div>
        <h4 className="font-medium text-red-700">
          Error
        </h4>

        <p className="text-sm text-red-600">
          {message}
        </p>
      </div>
    </div>
  );
}