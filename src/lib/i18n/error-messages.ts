import { useSyncExternalStore } from "react";
import { defaultLocale, localeDir, locales, LOCALE_COOKIE, type Locale } from "./locale-constants";

// The error screens (app/error.tsx, app/global-error.tsx) render in the browser
// after something has already gone wrong, so they can't call getDictionary():
// that would ship all 11 languages to every visitor, and a broken page is the
// worst place to depend on more code. These few strings live here instead.
export type ErrorMessages = {
  title: string;
  body: string;
  short: string;
  retry: string;
  home: string;
};

export const ERROR_MESSAGES: Record<Locale, ErrorMessages> = {
  en: {
    title: "Something went wrong",
    body: "An unexpected error occurred. You can try again, or head back to the homepage.",
    short: "Please try again.",
    retry: "Try again",
    home: "Back to home",
  },
  it: {
    title: "Qualcosa è andato storto",
    body: "Si è verificato un errore imprevisto. Puoi riprovare oppure tornare alla home.",
    short: "Riprova.",
    retry: "Riprova",
    home: "Torna alla home",
  },
  fr: {
    title: "Une erreur s'est produite",
    body: "Une erreur inattendue s'est produite. Vous pouvez réessayer ou retourner à l'accueil.",
    short: "Veuillez réessayer.",
    retry: "Réessayer",
    home: "Retour à l'accueil",
  },
  de: {
    title: "Etwas ist schiefgelaufen",
    body: "Es ist ein unerwarteter Fehler aufgetreten. Sie können es erneut versuchen oder zur Startseite zurückkehren.",
    short: "Bitte versuchen Sie es erneut.",
    retry: "Erneut versuchen",
    home: "Zurück zur Startseite",
  },
  ar: {
    title: "حدث خطأ ما",
    body: "حدث خطأ غير متوقع. يمكنك المحاولة مرة أخرى أو العودة إلى الصفحة الرئيسية.",
    short: "يُرجى المحاولة مرة أخرى.",
    retry: "حاول مرة أخرى",
    home: "العودة إلى الصفحة الرئيسية",
  },
  zh: {
    title: "出错了",
    body: "发生了意外错误。您可以重试，或返回首页。",
    short: "请重试。",
    retry: "重试",
    home: "返回首页",
  },
  ru: {
    title: "Что-то пошло не так",
    body: "Произошла непредвиденная ошибка. Вы можете повторить попытку или вернуться на главную.",
    short: "Повторите попытку.",
    retry: "Повторить",
    home: "На главную",
  },
  es: {
    title: "Algo salió mal",
    body: "Se ha producido un error inesperado. Puedes intentarlo de nuevo o volver al inicio.",
    short: "Inténtalo de nuevo.",
    retry: "Reintentar",
    home: "Volver al inicio",
  },
  pt: {
    title: "Ocorreu um problema",
    body: "Ocorreu um erro inesperado. Pode tentar novamente ou voltar à página inicial.",
    short: "Tente novamente.",
    retry: "Tentar novamente",
    home: "Voltar à página inicial",
  },
  hi: {
    title: "कुछ गलत हो गया",
    body: "एक अप्रत्याशित त्रुटि हुई। आप फिर कोशिश कर सकते हैं या होमपेज पर लौट सकते हैं।",
    short: "कृपया फिर कोशिश करें।",
    retry: "फिर कोशिश करें",
    home: "होमपेज पर लौटें",
  },
  ja: {
    title: "問題が発生しました",
    body: "予期しないエラーが発生しました。もう一度お試しいただくか、トップページに戻ってください。",
    short: "もう一度お試しください。",
    retry: "もう一度試す",
    home: "トップページへ戻る",
  },
};

// Browser-side: the visitor's chosen language (the same cookie the server reads),
// else their browser's, else English.
export function clientLocale(): Locale {
  if (typeof document === "undefined") return defaultLocale;
  const cookie = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]+)`))?.[1];
  if (locales.includes(cookie as Locale)) return cookie as Locale;
  const browser = navigator.language?.slice(0, 2).toLowerCase();
  return locales.find((locale) => locale === browser) ?? defaultLocale;
}

const noSubscribe = () => () => {};

// The visitor's language for a client-only screen: English while rendering on
// the server, then theirs. (useSyncExternalStore rather than state + effect, so
// there is no extra render and no set-state-in-effect.)
export function useClientLocale(): Locale {
  return useSyncExternalStore(noSubscribe, clientLocale, () => defaultLocale);
}

export { localeDir };
