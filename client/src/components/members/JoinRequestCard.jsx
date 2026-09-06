"use client";

import { flagEmoji, relativeTime } from "@/lib/format";
import { Avatar, Button, Card } from "@/components/ui";

/** Every answer is shown: the point of the questions is to read before approving. */
export default function JoinRequestCard({ request, onApprove, onDecline }) {
  const { user } = request;
  const name = `${user.firstName} ${user.lastName}`;

  return (
    <Card as="article" padding={18} radius="card" className="px-6 py-5">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar name={name} src={user.avatarUrl ?? undefined} size={46} />
        <div className="min-w-0">
          <p className="font-display font-extrabold text-lg tracking-[-0.02em]">{name}</p>
          <p className="text-meta text-sand-700 truncate">
            {`${user.email} · ${flagEmoji(user.countryCode)} ${user.country} · requested ${relativeTime(request.createdAt)}`}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="secondary" onClick={() => onDecline?.(request.id)}>
            Decline
          </Button>
          <Button onClick={() => onApprove?.(request.id)}>Approve</Button>
        </div>
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {request.answers.map((answer) => (
          <li key={answer.questionId} className="bg-sand-100 rounded-well px-[18px] py-3.5">
            <p className="text-kicker font-bold text-sand-700">{answer.question}</p>
            <p className="mt-1 text-ui">{answer.answer}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
