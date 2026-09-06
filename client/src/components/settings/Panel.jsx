import { Card } from "@/components/ui";

/** Every settings panel is one card with a title and a right-aligned save. */
export default function Panel({ title, action, children, onSubmit }) {
  return (
    <Card as={onSubmit ? "form" : "div"} onSubmit={onSubmit} padding={32} radius="panel" className="px-[34px]">
      <div className="flex flex-wrap items-center gap-4">
        <h3>{title}</h3>
        {action ? <div className="ml-auto">{action}</div> : null}
      </div>
      <div className="mt-6 flex flex-col gap-5">{children}</div>
    </Card>
  );
}
