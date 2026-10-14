"use client";

import Link from "next/link";

export default function LookStylesError({ retry }: { retry: () => void }) {
  return (
    <div className="p-6" role="alert">
      <h1 className="mb-3 text-xl">The look preview could not load</h1>
      <p className="mb-4">Try again, or return to Page layout to continue editing.</p>
      <div className="flex flex-wrap gap-4">
        <button type="button" onClick={retry} className="btn-primary min-h-11">
          Try again
        </button>
        <Link href="/admin/settings/page-layout" className="flex min-h-11 items-center underline">
          Back to Page layout
        </Link>
      </div>
    </div>
  );
}
