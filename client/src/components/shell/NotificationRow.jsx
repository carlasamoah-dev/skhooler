import { cn } from "@/lib/cn";
import { relativeTime } from "@/lib/format";
import { Avatar } from "@/components/ui";

export default function NotificationRow({ item }) {
  const actorName = item.actor ? `${item.actor.firstName} ${item.actor.lastName}` : null;

  return (
    <li
      className={cn(
        "flex gap-3 p-3 rounded-inner",
        item.isRead ? "" : item.actor ? "bg-brand-100" : "bg-sage-100",
      )}
    >
      {actorName ? (
        <Avatar name={actorName} src={item.actor.avatarUrl ?? undefined} size={38} />
      ) : (
        <span aria-hidden="true" className="w-[38px] h-[38px] rounded-full bg-sand-200 shrink-0" />
      )}
      <div className="min-w-0">
        <p className="text-ui">
          {actorName ? <strong className="font-display font-extrabold">{actorName}</strong> : null}
          {actorName ? " " : null}
          {item.text}
        </p>
        {item.detail ? <p className="mt-0.5 text-ui text-sand-700 truncate">{item.detail}</p> : null}
        <p className="mt-1 text-kicker text-sand-600">{relativeTime(item.createdAt)}</p>
      </div>
    </li>
  );
}
