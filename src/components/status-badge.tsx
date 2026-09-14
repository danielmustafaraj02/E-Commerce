const STATUS_STYLES: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  paid: "bg-success/10 text-success",
  processing: "bg-primary/10 text-primary",
  shipped: "bg-primary/10 text-primary",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-danger/10 text-danger",
  refunded: "bg-foreground/10 text-foreground/60",
  active: "bg-success/10 text-success",
  inactive: "bg-foreground/10 text-foreground/60",
  // Admin > Roadmap task priority/status.
  high: "bg-danger/10 text-danger",
  medium: "bg-warning/10 text-warning",
  low: "bg-success/10 text-success",
  open: "bg-primary/10 text-primary",
  done: "bg-foreground/10 text-foreground/60",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
        STATUS_STYLES[status] ?? "bg-foreground/10 text-foreground/60"
      }`}
    >
      {status}
    </span>
  );
}
