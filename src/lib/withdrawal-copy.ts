import type { Locale } from "@/lib/i18n/locale-constants";

const en = {
  request: "Withdraw from this contract here",
  confirm: "Confirm withdrawal",
  name: "Full name",
  email: "Email for confirmation",
  reason: "Additional information (optional)",
  invalid:
    "Enter your name, a valid confirmation email and no more than 2,000 characters of additional information.",
  submitted: "Your withdrawal has been recorded.",
  download: "Download withdrawal receipt",
  emailFailed:
    "The confirmation email could not be sent. Download your receipt and keep it as proof. Your withdrawal is still recorded.",
  subject: "Withdrawal receipt",
  statement: "I hereby withdraw from the contract for the following order:",
};
const it: typeof en = {
  request: "Recedere dal contratto qui",
  confirm: "Conferma recesso",
  name: "Nome e cognome",
  email: "Email per la conferma",
  reason: "Informazioni aggiuntive (facoltative)",
  invalid:
    "Inserisci nome e cognome, un'email valida per la conferma e al massimo 2.000 caratteri di informazioni aggiuntive.",
  submitted: "La tua dichiarazione di recesso è stata registrata.",
  download: "Scarica la ricevuta di recesso",
  emailFailed:
    "Non è stato possibile inviare l'email di conferma. Scarica e conserva la ricevuta come prova. Il recesso è comunque registrato.",
  subject: "Ricevuta di recesso",
  statement: "Comunico il recesso dal contratto relativo al seguente ordine:",
};
export function withdrawalCopy(locale: Locale | string | null) {
  return locale === "it" ? it : en;
}
