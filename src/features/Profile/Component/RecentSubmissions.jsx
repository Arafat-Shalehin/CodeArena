import { submissions } from "../data/submissions.data";

export default function RecentSubmissions() {
  return (
    <div className="divide-y divide-border">
      {submissions.map((item) => (
        <div
          key={item.id}
          className="p-4 flex justify-between items-center hover:bg-bg-muted/50 transition-colors"
        >
          <div className="flex gap-4 items-center">
            {/* Status Icon based on result */}
            <span
              className={
                item.status === "Accepted" ? "text-success" : "text-error"
              }
            >
              {item.status === "Accepted" ? "●" : "■"}
            </span>
            <div>
              <p className="text-sm font-semibold text-text-primary font-mono">
                {item.title}
              </p>
              <p className="text-xs text-text-muted">
                {item.time} • {item.lang}
              </p>
            </div>
          </div>

          {/* Badge using your design system classes */}
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              item.status === "Accepted"
                ? "bg-success-light text-success"
                : "bg-error-light text-error"
            }`}
          >
            {item.status}
          </span>
        </div>
      ))}
    </div>
  );
}
