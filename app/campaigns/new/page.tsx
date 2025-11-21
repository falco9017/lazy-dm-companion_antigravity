"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewCampaignPage() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/campaigns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description }),
            });

            if (res.ok) {
                const data = await res.json();
                router.push(`/campaigns/${data.id}`);
            } else {
                // Handle error
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error(error);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: "600px", marginTop: "4rem" }}>
            <div style={{ marginBottom: "2rem" }}>
                <Link href="/dashboard" style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    ← Back to Dashboard
                </Link>
            </div>

            <div className="card">
                <h1 style={{ marginBottom: "2rem", textAlign: "center" }}>Create New Campaign</h1>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem" }}>Campaign Title</label>
                        <input
                            type="text"
                            className="input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="e.g. The Curse of Strahd"
                        />
                    </div>

                    <div style={{ marginBottom: "2rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem" }}>Description</label>
                        <textarea
                            className="input"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="A brief summary of the adventure..."
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: "100%" }}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Creating..." : "Create Campaign"}
                    </button>
                </form>
            </div>
        </div>
    );
}
