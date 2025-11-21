"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useTranslation } from "@/hooks/useTranslation";

export function Navigation() {
    const { t } = useTranslation();

    return (
        <nav className="nav">
            <Link href="/dashboard" className="nav-logo">
                Lazy DM
            </Link>
            <div className="nav-links">
                <Link href="/dashboard">{t.common.campaigns}</Link>
                <Link href="/settings">{t.common.settings}</Link>
                <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="btn btn-secondary"
                    style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}
                >
                    {t.common.logout}
                </button>
            </div>
        </nav>
    );
}
