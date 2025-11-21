"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export default function NewSessionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { t } = useTranslation();
    const [step, setStep] = useState<"upload" | "transcribing" | "recap" | "saving">("upload");
    const [file, setFile] = useState<File | null>(null);
    const [transcription, setTranscription] = useState("");
    const [recap, setRecap] = useState("");
    const [sessionTitle, setSessionTitle] = useState("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleUpload = async () => {
        if (!file) return;
        setStep("transcribing");
        setError(null);

        try {
            // 1. Upload
            const formData = new FormData();
            formData.append("file", file);
            const uploadRes = await fetch("/api/sessions/upload", { method: "POST", body: formData });

            if (!uploadRes.ok) {
                const err = await uploadRes.json();
                throw new Error(err.error || "Upload failed");
            }

            const { tempId } = await uploadRes.json();

            // 2. Transcribe
            const transRes = await fetch("/api/sessions/transcribe", {
                method: "POST",
                body: JSON.stringify({ tempId }),
            });

            if (!transRes.ok) {
                const err = await transRes.json();
                throw new Error(err.details || err.error || "Transcription failed");
            }

            const { transcription } = await transRes.json();
            setTranscription(transcription);

            // 3. Generate Recap
            const recapRes = await fetch("/api/sessions/generate-recap", {
                method: "POST",
                body: JSON.stringify({ transcription }),
            });

            if (!recapRes.ok) {
                const err = await recapRes.json();
                throw new Error(err.details || err.error || "Recap generation failed");
            }

            const { recap } = await recapRes.json();
            setRecap(recap);
            setSessionTitle(`Session - ${new Date().toLocaleDateString()}`);
            setStep("recap");
        } catch (e: any) {
            console.error("Process failed:", e);
            setError(e.message);
            setStep("upload");
        }
    };

    const handleSave = async () => {
        setStep("saving");
        setError(null);

        try {
            const res = await fetch(`/api/sessions/${id}/update-wiki`, {
                method: "POST",
                body: JSON.stringify({
                    recap,
                    campaignId: id,
                    title: sessionTitle,
                    transcription
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to save session");
            }

            router.push(`/campaigns/${id}`);
        } catch (e: any) {
            console.error("Save failed:", e);
            setError(e.message);
            setStep("recap");
        }
    };

    return (
        <div className="container" style={{ maxWidth: "800px" }}>
            <div style={{ marginBottom: "2rem" }}>
                <Link href={`/campaigns/${id}`} style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    ← {t.common.back}
                </Link>
            </div>

            <h1>{t.campaign.newSession}</h1>

            {error && (
                <div style={{
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid var(--accent-red)",
                    color: "var(--accent-red)",
                    padding: "1rem",
                    borderRadius: "var(--radius-sm)",
                    marginBottom: "1.5rem"
                }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {step === "upload" && (
                <div className="card">
                    <h3>1. {t.session.uploadTitle}</h3>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
                        {t.session.uploadDesc}
                    </p>
                    <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        style={{ marginBottom: "1.5rem" }}
                    />
                    <button
                        onClick={handleUpload}
                        disabled={!file}
                        className="btn btn-primary"
                        style={{ opacity: file ? 1 : 0.5 }}
                    >
                        {t.session.startProcessing}
                    </button>
                </div>
            )}

            {step === "transcribing" && (
                <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                    <div className="spinner" style={{ margin: "0 auto 1.5rem" }}></div>
                    <h3>{t.session.transcribing}</h3>
                    <p style={{ color: "var(--text-secondary)" }}>
                        {t.session.transcribingDesc}
                    </p>
                </div>
            )}

            {step === "recap" && (
                <div className="card">
                    <h3>2. {t.session.reviewTitle}</h3>
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>
                            {t.session.sessionTitle}
                        </label>
                        <input
                            type="text"
                            className="input"
                            value={sessionTitle}
                            onChange={(e) => setSessionTitle(e.target.value)}
                        />
                    </div>

                    <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>
                            {t.session.generatedRecap}
                        </label>
                        <textarea
                            className="input"
                            rows={10}
                            value={recap}
                            onChange={(e) => setRecap(e.target.value)}
                            style={{ fontFamily: "inherit", lineHeight: "1.6" }}
                        />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                        <button onClick={() => setStep("upload")} className="btn btn-secondary">
                            {t.common.cancel}
                        </button>
                        <button onClick={handleSave} className="btn btn-primary">
                            {t.session.saveAndUpdate}
                        </button>
                    </div>
                </div>
            )}

            {step === "saving" && (
                <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                    <div className="spinner" style={{ margin: "0 auto 1.5rem" }}></div>
                    <h3>{t.session.updatingWiki}</h3>
                    <p style={{ color: "var(--text-secondary)" }}>
                        {t.session.updatingWikiDesc}
                    </p>
                </div>
            )}
        </div>
    );
}
