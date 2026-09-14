import bcrypt from "bcryptjs";
import { db } from "../src/lib/db";

async function main() {
  const storeSettings = await db.storeSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      storeName: "Demo Store",
      primaryColor: "#111827",
      secondaryColor: "#4F46E5",
      fontFamily: "Inter",
      defaultCurrency: "EUR",
      defaultLocale: "it-IT",
      contactEmail: "hello@demo-store.example",
      vatNumber: "IT00000000000",
      companyLegalName: "Demo Store S.r.l.",
      companyAddress: "Via Roma 1, 00100 Roma, Italy",
      pricesIncludeTax: true,
      freeShippingThreshold: 5000,
    },
  });

  const adminPasswordHash = await bcrypt.hash("ChangeMe123!", 12);
  await db.user.upsert({
    where: { email: "admin@demo-store.example" },
    update: {},
    create: {
      email: "admin@demo-store.example",
      passwordHash: adminPasswordHash,
      name: "Admin",
      role: "admin",
      emailVerified: new Date(),
    },
  });

  const electronics = await db.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: { name: "Electronics", slug: "electronics" },
  });
  const homeGoods = await db.category.upsert({
    where: { slug: "home-goods" },
    update: {},
    create: { name: "Home Goods", slug: "home-goods" },
  });

  const demoSupplier = await db.supplier.upsert({
    where: { id: "demo-supplier" },
    update: {},
    create: {
      id: "demo-supplier",
      name: "Global Home Textiles Co.",
      email: "orders@global-home-textiles.example",
      website: "https://global-home-textiles.example",
      notes: "Dropship partner — ships direct to customer, 3-5 day handling time.",
    },
  });

  // Real (Creative Commons, via loremflickr's Flickr-backed keyword search)
  // photos keyed by a fixed `lock` id so the same product always gets the
  // same image instead of a random one on every request.
  const photo = (keyword: string, lock: number) =>
    `https://loremflickr.com/600/600/${keyword}?lock=${lock}`;

  const products = [
    {
      name: "Wireless Headphones",
      slug: "wireless-headphones",
      description: "Over-ear wireless headphones with active noise cancellation.",
      price: 8999,
      sku: "ELEC-001",
      stockQty: 40,
      categoryId: electronics.id,
      images: [photo("headphones", 1), photo("headphones", 11)],
    },
    {
      name: "Smart Speaker",
      slug: "smart-speaker",
      description: "Compact smart speaker with voice assistant support.",
      price: 4999,
      sku: "ELEC-002",
      stockQty: 25,
      categoryId: electronics.id,
      images: [photo("speaker", 2), photo("speaker", 12)],
    },
    {
      name: "Ceramic Coffee Mug",
      slug: "ceramic-coffee-mug",
      description: "350ml handmade ceramic mug, dishwasher safe.",
      price: 1499,
      sku: "HOME-001",
      stockQty: 100,
      categoryId: homeGoods.id,
      images: [photo("mug", 3), photo("mug", 13)],
    },
    {
      name: "Linen Throw Pillow",
      slug: "linen-throw-pillow",
      description: "45x45cm linen-blend throw pillow cover.",
      price: 2499,
      sku: "HOME-002",
      // Dropshipped: no stock of ours, supplier ships direct to the
      // customer. trackInventory=false skips the stock check at checkout.
      stockQty: 0,
      trackInventory: false,
      supplierId: demoSupplier.id,
      supplierSku: "GHT-PILLOW-45",
      costPrice: 1050,
      categoryId: homeGoods.id,
      images: [photo("pillow", 4), photo("pillow", 14)],
    },
  ];

  for (const { images, ...product } of products) {
    const imageRows = images.map((url, position) => ({
      url,
      altText: product.name,
      position,
    }));

    await db.product.upsert({
      where: { slug: product.slug },
      // `update` mirrors `create` (not `{}`) so re-running the seed actually
      // fixes existing rows instead of silently leaving stale data in place.
      update: { ...product, images: { deleteMany: {}, create: imageRows } },
      create: { ...product, images: { create: imageRows } },
    });
  }

  await db.taxRule.upsert({
    where: { id: "it-standard" },
    update: {},
    create: {
      id: "it-standard",
      country: "IT",
      ratePercent: 22,
      name: "IVA standard",
    },
  });
  await db.taxRule.upsert({
    where: { id: "it-reduced" },
    // Scoped to a category on purpose — a country can have at most one
    // categoryId:null (store-wide default) rule, or checkout can't tell
    // which one applies.
    update: { categoryId: homeGoods.id },
    create: {
      id: "it-reduced",
      country: "IT",
      ratePercent: 10,
      name: "IVA ridotta",
      categoryId: homeGoods.id,
    },
  });

  const standardShipping = await db.shippingMethod.upsert({
    where: { id: "standard" },
    update: {},
    create: {
      id: "standard",
      name: "Standard Shipping",
      basePrice: 499,
      pricePerKg: 0,
      estimatedDaysMin: 3,
      estimatedDaysMax: 5,
    },
  });
  const expressShipping = await db.shippingMethod.upsert({
    where: { id: "express" },
    update: {},
    create: {
      id: "express",
      name: "Express Shipping",
      basePrice: 1299,
      pricePerKg: 0,
      estimatedDaysMin: 1,
      estimatedDaysMax: 2,
    },
  });

  const euZone = await db.shippingZone.upsert({
    where: { id: "eu" },
    update: {},
    create: { id: "eu", name: "European Union" },
  });

  for (const country of ["IT", "FR", "DE", "ES", "NL"]) {
    await db.shippingZoneCountry.upsert({
      where: { zoneId_country: { zoneId: euZone.id, country } },
      update: {},
      create: { zoneId: euZone.id, country },
    });
  }
  for (const method of [standardShipping, expressShipping]) {
    await db.shippingZoneMethod.upsert({
      where: { zoneId_methodId: { zoneId: euZone.id, methodId: method.id } },
      update: {},
      create: { zoneId: euZone.id, methodId: method.id },
    });
  }

  await db.discountCode.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      percentOff: 10,
      maxUses: 100,
    },
  });

  // Starting templates, not legal advice — have a lawyer review before
  // taking real orders, especially the VAT/OSS and withdrawal-right sections.
  const legalName = storeSettings.companyLegalName ?? storeSettings.storeName;
  const legalPages = [
    {
      slug: "terms",
      title: "Terms & Conditions",
      content: `1. About these terms
These Terms & Conditions govern all purchases made on this website, operated by ${legalName} (VAT/P.IVA: ${storeSettings.vatNumber ?? "N/A"}), ${storeSettings.companyAddress ?? ""}. By placing an order, you agree to these terms.

2. Orders and contract formation
An order is an offer to buy. The contract is formed when we send you an order confirmation email. We reserve the right to refuse or cancel an order (e.g. pricing errors, stock unavailability, suspected fraud) before that point, with a full refund of any amount already charged.

3. Prices and payment
All prices are shown in ${storeSettings.defaultCurrency}${storeSettings.pricesIncludeTax ? " and include applicable VAT/IVA" : " and exclude applicable VAT/IVA, added at checkout"}. Payment is processed by Stripe and/or PayPal; we never see or store your full card details.

4. Delivery
Estimated delivery times are shown at checkout for each shipping method and are not guaranteed delivery dates.

5. Right of withdrawal
EU consumers have a 14-day right of withdrawal — see our Return & Refund Policy.

6. Liability
Nothing in these terms limits liability that cannot be limited under applicable law (e.g. for death, personal injury, or fraud).

7. Governing law
These terms are governed by the laws of Italy, without prejudice to any mandatory consumer-protection rights you have in your country of residence.

8. Contact
Questions about these terms: ${storeSettings.contactEmail}.`,
    },
    {
      slug: "privacy",
      title: "Privacy Policy",
      content: `1. Who we are
${legalName} ("we", "us") is the data controller for personal data collected through this website. Contact: ${storeSettings.contactEmail}.

2. What we collect
- Account data: name, email, hashed password.
- Order data: shipping address, order contents, order history.
- Payment data: handled entirely by Stripe/PayPal — we only ever store their transaction ID and status, never your card or bank details.
- Technical data: IP address and basic request metadata, for security (rate limiting, fraud prevention) and to operate the site.
- Consent choices: which optional cookie categories you've accepted, and when.

3. Why we process it (legal basis)
- Fulfilling your order and account (contract).
- Fraud prevention and account security (legitimate interest).
- Analytics/marketing cookies (consent — see our Cookie Policy).
- Invoicing and tax records (legal obligation).

4. Retention
Order and invoice records are kept as long as required by applicable tax/accounting law. Account data is kept until you delete your account; deleting your account anonymizes your profile while retaining the order records the law requires us to keep.

5. Your rights
Under GDPR you can request access, correction, deletion, or export of your personal data. You can download your data or delete your account any time from your Account page, or contact us at ${storeSettings.contactEmail}.

6. Third parties we share data with
Stripe and/or PayPal (payment processing), our hosting provider, and our transactional email provider — each acting under their own data processing agreement with us, only for the purpose of providing the service.

7. International transfers
Where a provider above is located outside the EU/EEA, transfers rely on that provider's standard contractual clauses or equivalent safeguard.

8. Changes
We'll update this policy if our practices change and update the date below.`,
    },
    {
      slug: "returns",
      title: "Return & Refund Policy",
      content: `1. EU 14-day right of withdrawal
If you're an EU consumer, you have the right to withdraw from your purchase within 14 days of receiving your goods, without giving any reason. To exercise this right, contact us at ${storeSettings.contactEmail} with your order number before the 14-day period ends.

2. Returning goods
After notifying us, please return the goods within 14 days, unused and in their original packaging where possible. You are responsible for return shipping costs unless the item is faulty or not as described.

3. Refunds
Once we receive and inspect the return, we'll refund the original payment method within 14 days, including standard delivery cost (not any express-shipping upgrade you chose).

4. Faulty or incorrect items
If an item arrives faulty, damaged, or different from what you ordered, contact us at ${storeSettings.contactEmail} with photos where possible — we'll arrange a replacement, repair, or full refund including return shipping, per your statutory rights.

5. Exceptions
Perishable goods, personalized/made-to-order items, and sealed goods unsealed after delivery (where unsealing affects hygiene or health) may be excluded from the right of withdrawal, as permitted by law.

6. How to start a return
Email ${storeSettings.contactEmail} with your order number and reason for return.`,
    },
    {
      slug: "cookies",
      title: "Cookie Policy",
      content: `1. What are cookies
Small files stored on your device that let a website remember information between visits.

2. Categories we use
- Essential: required for the site to function (session/login, cart, security) — cannot be disabled.
- Analytics: help us understand how the site is used, so we can improve it. Only set with your consent.
- Marketing: used to measure and personalize advertising. Only set with your consent.

3. Your choices
You can accept all, reject non-essential, or customize your choices via the cookie banner shown on your first visit, or at any time by clearing your browser's site data to see it again.

4. Consent records
We log a timestamped record of what you consented to (essential/analytics/marketing), tied to your account or an anonymous identifier if you're not signed in, so we can demonstrate compliance.

5. Third-party cookies
Where analytics or marketing cookies are enabled, the relevant third-party provider's own cookie/privacy policy also applies to data they collect.

6. Contact
Questions about this policy: ${storeSettings.contactEmail}.`,
    },
  ];
  for (const page of legalPages) {
    await db.legalPage.upsert({
      where: { slug: page.slug },
      update: page,
      create: page,
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
