import { ShippingMethodForm } from "../method-form";
import { createShippingMethod } from "../actions";

export default function NewShippingMethodPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New shipping method</h1>
      <ShippingMethodForm action={createShippingMethod} submitLabel="Create method" />
    </div>
  );
}
