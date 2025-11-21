import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
    const session = await getServerSession(authOptions);

    if (session) {
        redirect("/dashboard");
    }

    return (
        <div className="container" style={{ textAlign: "center", marginTop: "4rem" }}>
            <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>Lazy DM Companion</h1>
            <p style={{ fontSize: "1.2rem", color: "var(--text-secondary)", marginBottom: "2rem" }}>
                Automate your session logs and campaign wiki with AI.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                <Link href="/login" className="btn btn-primary">
                    Login
                </Link>
                <Link href="/register" className="btn btn-secondary">
                    Register
                </Link>
            </div>
        </div>
    );
}
