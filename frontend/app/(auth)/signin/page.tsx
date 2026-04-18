"use client"
import Link from "next/link"
import { useState } from "react"
import { login } from "../../../src/lib/axios"
import { Request } from "../../../src/lib/lib"
import { useRouter } from "next/navigation"

export default function Signin() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const router = useRouter()

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const response = await login(email, password)
        localStorage.setItem("token", response.data.token)
        localStorage.setItem("email", email)
        localStorage.setItem("name", response.data.user.name)

        router.push("/dashboard")
    }

    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-[#0f0f0f]">
            <div className="flex flex-col justify-center items-center w-full max-w-sm gap-6">

                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#7c3aed]">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="6" height="6" rx="1" fill="white" />
                        <rect x="11" y="3" width="6" height="6" rx="1" fill="white" opacity="0.5" />
                        <rect x="3" y="11" width="6" height="6" rx="1" fill="white" opacity="0.5" />
                        <rect x="11" y="11" width="6" height="6" rx="1" fill="white" />
                    </svg>
                </div>

                <h1 className="text-white text-2xl font-semibold text-center">Welcome Back</h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#141414] text-white placeholder-[#888888] border border-[#ffffff15] rounded-lg px-4 py-3 focus:outline-none focus:border-[#3b3840]"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#141414] text-white placeholder-[#888888] border border-[#ffffff15] rounded-lg px-4 py-3 focus:outline-none focus:border-[#3b3840]"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#6d28d9] border border-[#ffffff20] hover:bg-[#6d28d9] text-white font-medium py-3 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                        Sign In
                    </button>
                </form>
                <p className="text-[#888888] text-sm text-center">
                    Don't have an account?{" "}
                    <Link href="/signup" className="text-[#7c3aed] hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    )
}