// Correct only known starter-template clauses. Bespoke legal text stays intact.
export function repairLegalContent(slug: string, content: string): string {
  if (slug === "returns" && content.startsWith("1. EU 14-day right of withdrawal")) {
    content = content.replace(
      "unused and in their original packaging where possible",
      "with their accessories. You may inspect and handle the goods as necessary to establish their nature, characteristics and functioning; you are responsible only for any diminished value caused by handling beyond this. Original packaging is appreciated but is not a condition for withdrawal"
    );
    content = content.replace(
      "Once we receive and inspect the return, we'll refund the original payment method within 14 days",
      "We will refund your original payment method without undue delay and within 14 days of being informed of your withdrawal. Unless we offer to collect the goods, we may withhold reimbursement until we receive the goods or you provide evidence of sending them back, whichever happens first. The refund includes the price paid"
    );
    content = content.replace(
      "personalized/made-to-order items",
      "goods made to your specifications or clearly personalized (production after ordering alone does not exclude withdrawal)"
    );
    content = content.replace(
      "with your order number and reason for return.",
      "with your order number and a clear statement that you wish to withdraw. No reason is required. You can also use the withdrawal function on your order-confirmation page: open the form, confirm your name and confirmation email, then select Confirm withdrawal.\n\nModel withdrawal form (optional):\nTo the seller identified in our Terms & Conditions:\nI hereby give notice that I withdraw from my contract of sale of the following goods: [goods].\nOrdered on / received on: [date].\nName of consumer: [name].\nAddress of consumer: [address].\nDate: [date].\nSignature of consumer (only if this form is sent on paper)."
    );
    if (!content.includes("Legal guarantee of conformity"))
      content +=
        "\n\nLegal guarantee of conformity\nFor new goods sold to consumers, the seller is liable for lack of conformity appearing within two years of delivery. Where the statutory conditions are met, you are entitled to repair or replacement free of charge, or a price reduction or termination of the contract. These rights are separate from the right of withdrawal.";
  }
  if (slug === "cookies")
    content = content.replace(
      "via the cookie banner shown on your first visit, or at any time by clearing your browser's site data to see it again",
      "via the cookie banner shown on your first visit, or at any time using the cookie preferences button in the footer. You can withdraw optional consent as easily as you give it"
    );
  if (slug === "privacy")
    content = content.replace(
      "Under GDPR you can request access, correction, deletion, or export of your personal data.",
      "Under GDPR, subject to the applicable conditions, you can request access, rectification, erasure, restriction of processing and data portability, and object to processing based on legitimate interests. You can withdraw consent at any time without affecting the lawfulness of processing before withdrawal. You have the right to lodge a complaint with the Italian supervisory authority (Garante per la protezione dei dati personali, www.garanteprivacy.it) or another competent supervisory authority."
    );
  if (slug === "privacy")
    content = content.replace(
      "each acting under their own data processing agreement with us, only for the purpose of providing the service.",
      "acting as processors or independent controllers depending on their role. Processing by independent controllers is also described in their own privacy notices."
    );
  return content;
}

export function sellerDetails(settings: {
  companyLegalName: string | null;
  companyAddress: string | null;
  vatNumber: string | null;
}): string[] {
  return [
    settings.companyLegalName === "Demo Store S.r.l." ? null : settings.companyLegalName,
    settings.companyAddress === "Via Roma 1, 00100 Roma, Italy" ? null : settings.companyAddress,
    settings.vatNumber && settings.vatNumber !== "IT00000000000"
      ? `P. IVA: ${settings.vatNumber}`
      : null,
  ].filter((value): value is string => Boolean(value?.trim()));
}
