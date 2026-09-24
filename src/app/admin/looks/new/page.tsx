import { LookForm } from "../look-form";
import { createLook } from "../actions";
import { lookProductOptions } from "../product-options";

export default async function NewLookPage() {
  const products = await lookProductOptions();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New look</h1>
      <LookForm action={createLook} products={products} submitLabel="Create look" />
    </div>
  );
}
