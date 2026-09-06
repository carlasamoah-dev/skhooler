import { cn } from "@/lib/cn";

export default function EmptyState({ title, body, action, icon: Icon, className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center text-center px-6 py-14 bg-surface rounded-card shadow-soft",
        className,
      )}
    >
      {Icon ? (
        <span className="w-11 h-11 rounded-full bg-sand-200 flex items-center justify-center mb-4">
          <Icon className="lucide w-5 h-5 text-sand-700" aria-hidden="true" />
        </span>
      ) : null}
      <h4 className="text-card-title">{title}</h4>
      {body ? <p className="mt-2 text-body text-sand-800 max-w-[46ch]">{body}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
