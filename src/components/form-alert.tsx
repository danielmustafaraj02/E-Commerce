export function FormAlert({
  type,
  children,
}: {
  type: "error" | "success";
  children: React.ReactNode;
}) {
  return (
    <div className={type === "error" ? "alert alert-error" : "alert alert-success"}>
      {type === "error" ? (
        <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 012 0v3a1 1 0 11-2 0V9zm1-4a1.25 1.25 0 100 2.5A1.25 1.25 0 0010 5z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      )}
      <span>{children}</span>
    </div>
  );
}
