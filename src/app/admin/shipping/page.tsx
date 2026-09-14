import Link from "next/link";

export default function AdminShippingPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Shipping</h1>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/admin/shipping/methods"
          className="border-foreground/20 hover:border-primary flex-1 rounded border p-4"
        >
          <p className="font-medium">Methods</p>
          <p className="text-foreground/70 text-sm">
            Define shipping options, prices, and delivery estimates.
          </p>
        </Link>
        <Link
          href="/admin/shipping/zones"
          className="border-foreground/20 hover:border-primary flex-1 rounded border p-4"
        >
          <p className="font-medium">Zones</p>
          <p className="text-foreground/70 text-sm">
            Map countries to the methods available for them at checkout.
          </p>
        </Link>
      </div>
    </div>
  );
}
