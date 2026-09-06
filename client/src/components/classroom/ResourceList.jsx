import { Download } from "lucide-react";

export default function ResourceList({ attachments = [] }) {
  if (attachments.length === 0) return null;

  return (
    <div className="bg-sand-100 rounded-inner p-5">
      <h4 className="text-[17px]">Resources</h4>
      <ul className="mt-3 flex flex-col gap-2">
        {attachments.map((file) => (
          <li key={file.name}>
            <a href={file.url} className="inline-flex items-center gap-2 text-ui">
              <Download className="lucide w-4 h-4 shrink-0" aria-hidden="true" />
              {file.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
