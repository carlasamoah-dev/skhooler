import Link from "next/link";

import AuthBrand from "./AuthBrand";

/** The centred single-column page the undesigned auth screens reuse. */
export default function AuthPageShell({ title, sub, children, footer }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-[440px] bg-surface rounded-overlay shadow-md p-9">
        <Link href="/discover" className="no-underline text-ink">
          <AuthBrand />
        </Link>
        <h1 className="text-[26px] mt-5">{title}</h1>
        {sub ? <p className="text-ui text-sand-700 -mt-1.5">{sub}</p> : null}
        {children}
        {footer ? <div className="mt-6 text-ui text-sand-700 text-center">{footer}</div> : null}
      </div>
    </div>
  );
}
