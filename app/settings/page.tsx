"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export default function SettingsPage() {
    const { data: session, update } = useSession();
    const { t, lang } = useTranslation();
    const [selectedLang, setSelectedLang] = useState(lang);
    const [nickname, setNickname] = useState((session?.user as any)?.nickname || "");
    const [message, setMessage] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const isGuest = (session?.user as any)?.isGuest;

    const handleSave = async () => {
        try {
            const res = await fetch("/api/user/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ language: selectedLang, nickname }),
            });

            if (res.ok) {
                await update({ language: selectedLang, nickname }); // Update session client-side
                setMessage(t.settings.saveSuccess);
                router.refresh();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm(t.settings.confirmDelete || "Delete your account and all data? This cannot be undone.")) {
            return;
        }

        setIsDeleting(true);
        try {
            const res = await fetch("/api/user/delete", {
                method: "DELETE"
            });

            if (res.ok) {
                await signOut({ callbackUrl: "/" });
            } else {
                alert("Failed to delete account");
            }
        } catch (error) {
            console.error(error);
            alert("Failed to delete account");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: "600px", marginTop: "4rem" }}>
            <div style={{ marginBottom: "2rem" }}>
                <Link href="/dashboard" style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    ← {t.common.back}
                </Link>
            </div>

            <div className="card">
                <h1 style={{ marginBottom: "0.5rem" }}>{t.settings.title}</h1>

                {isGuest && (
                    <div style={{
                        backgroundColor: "rgba(255, 82, 82, 0.1)",
                        border: "1px solid rgba(255, 82, 82, 0.3)",
                        borderRadius: "var(--radius-md)",
                        padding: "1rem",
                        marginBottom: "1.5rem"
                    }}>
                        <p style={{ margin: 0, fontSize: "0.9rem", color: "rgb(255, 82, 82)" }}>
                            ⚠️ {t.settings.guestWarning || "You're in guest mode. Your data will be deleted when you close the browser. Create an account to save your data permanently."}
                        </p>
                        <Link href="/register" className="btn btn-primary" style={{ marginTop: "1rem", display: "inline-block" }}>
                            {t.settings.createAccount || "Create Account"}
                        </Link>
                    </div>
                )}

                {message && (
                    <div style={{ color: "var(--accent-gold)", marginBottom: "1rem", padding: "0.75rem", backgroundColor: "rgba(255, 193, 7, 0.1)", borderRadius: "var(--radius-sm)" }}>
                        ✓ {message}
                    </div>
                )}

                <div style={{ marginBottom: "2rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                        {t.settings.nickname || "Nickname"}
                    </label>
                    <input
                        type="text"
                        className="input"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder={session?.user?.name || "Enter a nickname"}
                    />
                </div>

                <div style={{ marginBottom: "2rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                        {t.settings.language}
                    </label>
                    <select
                        className="input"
                        value={selectedLang}
                        onChange={(e) => setSelectedLang(e.target.value as any)}
                    >
                        <option value="en">English</option>
                        <option value="it">Italiano</option>
                    </select>
                </div>

                <button onClick={handleSave} className="btn btn-primary">
                    {t.common.save}
                </button>

                <hr style={{ margin: "2rem 0", border: "none", borderTop: "1px solid var(--border-color)" }} />

                <h3 style={{ color: "var(--accent-red)", marginBottom: "1rem" }}>
                    {t.settings.dangerZone || "Danger Zone"}
                </h3>
                <p style={{ color: "var(--text-secondary)", marginBottom: "1rem", fontSize: "0.9rem" }}>
                    {t.settings.deleteAccountDesc || "Permanently delete your account and all associated campaigns, sessions, and wiki entries. This action cannot be undone."}
                </p>
                <button
                    onClick={handleDeleteAccount}
                    className="btn btn-secondary"
                    style={{ backgroundColor: "var(--accent-red)" }}
                    disabled={isDeleting}
                >
                    {isDeleting ? t.settings.deleting : t.settings.deleteAccount}
                </button>
            </div>
        </div>
    );
}
