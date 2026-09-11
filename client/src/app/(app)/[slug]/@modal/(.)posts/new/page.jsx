import PostComposer from "@/components/feed/PostComposer";

export default function Page() {
  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-50 w-full min-h-screen sm:min-h-0 sm:max-h-[90vh] sm:rounded-2xl shadow-2xl flex flex-col max-w-[900px] relative z-10 overflow-y-auto">
        <PostComposer />
      </div>
    </div>
  );
}
