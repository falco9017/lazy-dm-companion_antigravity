"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError("Invalid email or password");
            setIsLoading(false);
        } else if (result?.ok) {
            router.push("/dashboard");
        }
    };

    const handleGuestLogin = async () => {
        setIsLoading(true);
        await signIn("guest", { callbackUrl: "/dashboard" });
        setIsLoading(false);
    };

    return (
        <div className="container" style={{ maxWidth: "450px", marginTop: "4rem" }}>
            <div className="card">
                <h1 style={{ textAlign: "center", marginBottom: "0.5rem", fontSize: "2rem" }}>
                    🎲 Lazy DM Companion
                </h1>
                <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: "2rem" }}>
                    Manage your D&D campaigns effortlessly
                </p>

                {/* Guest Mode Warning */}
                <div style={{
                    backgroundColor: "rgba(255, 193, 7, 0.1)",
                    border: "1px solid rgba(255, 193, 7, 0.3)",
                    borderRadius: "var(--radius-md)",
                    padding: "1rem",
                    marginBottom: "1.5rem"
                }}>
                    <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem", color: "rgb(255, 193, 7)" }}>
                        💡 Quick Start with Guest Mode
                    </h3>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        Try the app instantly! Guest data will be deleted when you close your browser.
                    </p>
                </div>

                <button
                    onClick={handleGuestLogin}
                    className="btn btn-secondary"
                    style={{ width: "100%", marginBottom: "1.5rem" }}
                    disabled={isLoading}
                >
                    👤 Continue as Guest
                </button>

                <div style={{
                    display: "flex",
                    alignItems: "center",
                    margin: "1.5rem 0",
                    color: "var(--text-secondary)"
                }}>
                    <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-color)" }}></div>
                    <span style={{ padding: "0 1rem", fontSize: "0.85rem" }}>or sign in</span>
                    <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-color)" }}></div>
                </div>

                {error && (
                    <div style={{
                        color: "var(--accent-red)",
                        backgroundColor: "rgba(231, 76, 60, 0.1)",
                        border: "1px solid rgba(231, 76, 60, 0.3)",
                        borderRadius: "var(--radius-md)",
                        padding: "0.75rem",
                        marginBottom: "1rem",
                        textAlign: "center",
                        fontSize: "0.9rem"
                    }}>
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
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: "100%" }}
                        disabled={isLoading}
                    >
                        {isLoading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <div style={{ textAlign: "center", margin: "1rem 0", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                    or
                </div>

                <button
                    onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                    className="btn btn-secondary"
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                    disabled={isLoading}
                >
                    <svg width="18" height="18" viewBox="0 0 18 18">
                        <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" />
                        <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z" />
                        <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z" />
                        <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z" />
                    </svg>
                    Sign in with Google
                </button>

                <p style={{ textAlign: "center", marginTop: "1.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    Don't have an account? <Link href="/register" style={{ color: "var(--primary-color)" }}>Register</Link>
                </p>
            </div>
        </div>
    );
}
