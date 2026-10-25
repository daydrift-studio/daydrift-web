import { zhCN, type TranslationDict } from "./locales/zh-CN";
import { en } from "./locales/en";

export type Locale = "zh-CN" | "en";

export const translations: Record<Locale, TranslationDict> = {
  "zh-CN": zhCN,
  en: en
};

export function getTranslation(locale: Locale = "zh-CN"): TranslationDict {
  return translations[locale] ?? zhCN;
}

export { zhCN, en, type TranslationDict };
