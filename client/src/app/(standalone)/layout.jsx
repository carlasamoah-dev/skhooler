export default function StandaloneLayout({ children }) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {children}
    </div>
  );
}
