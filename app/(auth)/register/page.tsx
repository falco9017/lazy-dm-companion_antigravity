"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                router.push("/login");
            } else {
                const data = await res.json();
                setError(data.error || "Registration failed");
            }
        } catch (err) {
            setError("An error occurred");
        }
    };

    return (
        <div className="container" style={{ maxWidth: "400px", marginTop: "4rem" }}>
            <div className="card">
                <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>Register</h2>
                {error && (
                    <div style={{ color: "var(--accent-red)", marginBottom: "1rem", textAlign: "center" }}>
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        className="input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                        Create Account
                    </button>
                </form>
                <p style={{ textAlign: "center", marginTop: "1rem", color: "var(--text-secondary)" }}>
                    Already have an account? <Link href="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}
