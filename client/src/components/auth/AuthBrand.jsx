/** The dialog's brand row, reused on the standalone auth pages. */
export default function AuthBrand({ children }) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="w-10 h-10 rounded-full bg-brand text-ground font-display font-extrabold tracking-[-0.02em] text-ui grid place-items-center"
      >
        sk
      </span>
      <span className="font-display font-extrabold tracking-[-0.02em] text-2xl">skhooler</span>
      {children}
    </div>
  );
}
