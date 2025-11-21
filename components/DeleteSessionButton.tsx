"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteSessionButton({ campaignId, sessionId, t }: { campaignId: string; sessionId: string; t: any }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm(t.session.confirmDelete || "Are you sure you want to delete this session?")) {
            return;
        }

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/campaigns/${campaignId}/sessions/${sessionId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Failed to delete");
            }

            router.refresh();
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed to delete session");
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="btn btn-secondary"
            style={{ fontSize: "0.8rem", backgroundColor: "var(--accent-red)", opacity: isDeleting ? 0.5 : 1 }}
        >
            {isDeleting ? "..." : "🗑️"}
        </button>
    );
}
