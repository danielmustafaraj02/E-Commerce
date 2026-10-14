# Legal corrections — 13 October 2026

Implemented locally; not deployed or certified as legally compliant.

- Known English starter clauses are repaired at render time without overwriting bespoke database content. New seeds use the same corrections. No seed was run against the existing database.
- Withdrawal: reimbursement deadline runs from notification, with withholding until receipt or proof of dispatch; reasonable inspection is permitted; motivation is optional; mere production after ordering is not automatically personalization; model withdrawal form and statutory guarantee information added.
- Order-confirmation form collects/lets the customer confirm name, order and confirmation email, with an explicit withdrawal confirmation. Receipt content and UTC transmission time are saved with the return request; email is attempted and a receipt can be downloaded, including on later visits. Email failure does not invalidate the saved declaration. Existing access controls and rate limits remain.
- Cookie preferences can be reopened from the footer and reflect previous choices. Invalid stored choices are treated as no consent.
- Footer displays configured seller name, address and VAT number, omitting the known demo values. New seeds no longer invent these identifiers.
- Starter privacy notice includes objection, restriction, withdrawal of consent, complaint rights and distinguishes processors from independent controllers.

## Still requires actual business information or deployment verification

1. Real legal seller identity, geographic address, contact information, VAT number, business registration details as applicable and return destination. Enter these in store settings and review database legal content; editing settings does not automatically rewrite bespoke/stale legal pages.
2. Accountant confirmation of VAT regime, startup filings and countries served.
3. Actual retention periods/criteria by data category, provider identities and roles, transfer safeguards, newsletter processing, and cookie/storage inventory with lifetimes. These cannot be inferred or certified from a starter template.
4. Display the official harmonised legal guarantee notice in colour. Official asset: https://www.mimit.gov.it/images/stories/documenti/Legal_guarantee_notice_ITN.pdf . Network restrictions prevented downloading it into this workspace; plain guarantee text does not replace this notice.
5. New withdrawal-specific copy is Italian/English; other storefront locales currently use English for these labels and receipts. Translate before targeting those markets.
6. Verify configured transactional email delivery, live order access and receipt download in production. The existing email service has a daily cap; failures are visible with a downloadable receipt, but operational delivery still needs monitoring.
7. Deploy these source changes. The database was not reachable for inspection; custom policies may require additional corrections. Obtain professional review before taking real orders.

Sources consulted:
- MIMIT withdrawal FAQ: https://www.mimit.gov.it/it/assistenza/domande-frequenti/diritto-di-recesso-domande-frequenti-faq
- D.Lgs. 209/2025, article 54-bis: https://www.gazzettaufficiale.it/atto/serie_generale/caricaArticoloDefault/originario?atto.codiceRedazionale=26G00002&atto.dataPubblicazioneGazzetta=2026-01-08&atto.tipoProvvedimento=DECRETO+LEGISLATIVO
- Garante cookie FAQ: https://www.garanteprivacy.it/faq/Cookie
- MIMIT guarantee notice: https://www.mimit.gov.it/it/normativa/notifiche-e-avvisi/avviso-armonizzato-ed-etichetta-di-durabilita-armonizzata
