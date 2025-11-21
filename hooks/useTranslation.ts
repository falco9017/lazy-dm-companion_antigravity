"use client";

import { useSession } from "next-auth/react";
import { dictionary, Language } from "@/lib/dictionary";

export function useTranslation() {
    const { data: session } = useSession();
    // Default to 'en' if session not loaded or language not set
    const lang = ((session?.user as any)?.language as Language) || "en";

    return {
        t: dictionary[lang] || dictionary.en,
        lang
    };
}
