import Link from "next/link"
import { Syne } from "next/font/google"
const syne = Syne({ subsets: ["latin"] })

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 h-15 bg-[#0a0a0a]/85 backdrop-blur-md border-b border-white/[0.07]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#7c3aed] rounded-lg flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="3" width="6" height="6" rx="1" fill="white" />
              <rect x="11" y="3" width="6" height="6" rx="1" fill="white" opacity="0.5" />
              <rect x="3" y="11" width="6" height="6" rx="1" fill="white" opacity="0.5" />
              <rect x="11" y="11" width="6" height="6" rx="1" fill="white" />
            </svg>
          </div>
          <span className="text-white font-bold text-[15px] tracking-tight">DevBoard</span>
        </div>

        <div className="flex items-center gap-8">
          <a href="#features" className="text-[#666] text-sm hover:text-white transition-colors">Features</a>
          <a href="#" className="text-[#666] text-sm hover:text-white transition-colors">Docs</a>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/signin" className="text-[#888] text-sm px-4 py-2 rounded-lg border border-white/[0.07] hover:text-white hover:border-white/20 transition-all">
            Sign in
          </Link>
          <Link href="/signup" className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm px-4 py-2 rounded-lg transition-colors">
            Get started
          </Link>
        </div>
      </nav>

      <section className="min-h-screen flex flex-col items-center justify-center text-center px-10 pt-24 pb-20 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-150 h-100 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.12)_0%,transparent_70%)] pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 bg-[#7c3aed]/10 border border-[#7c3aed]/25 text-[#a78bfa] px-3.5 py-1.5 rounded-full text-xs font-medium mb-7">
          <div className="w-1.5 h-1.5 bg-[#7c3aed] rounded-full" />
          Real-time collaboration for developers
        </div>

        <h1 className="text-[clamp(48px,7vw,88px)] font-black leading-[1.05] tracking-[-0.03em] mb-6 max-w-205"
          style={{ fontFamily: "'Syne', sans-serif" }}>
          Ship faster.<br />
          <span className="text-[#7c3aed]">Together.</span>
        </h1>

        <p className="text-[17px] text-[#666] max-w-115 leading-[1.7] mb-10 font-light">
          A lightweight Kanban board built for developers and small teams. Real-time updates, zero bloat.
        </p>

        <div className="flex items-center gap-3 mb-16">
          <Link href="/signup" className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-7 py-3.5 rounded-xl text-[15px] font-medium transition-all hover:-translate-y-px">
            Start for free →
          </Link>
          <a href="#features" className="text-[#888] px-7 py-3.5 rounded-xl text-[15px] border border-white/[0.07] hover:text-white hover:border-white/15 transition-all">
            See how it works
          </a>
        </div>

        <div className="w-full max-w-225 bg-[#111] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.07] bg-[#181818]">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-2 text-[#333] text-xs">devboard.app / project / backend-v2</span>
          </div>

          <div className="grid grid-cols-4 divide-x divide-white/5">
            {[
              {
                title: "To Do", count: 3,
                tasks: [
                  { title: "Set up auth middleware", priority: "HIGH", color: "bg-red-500/10 text-red-400", assignee: "T" },
                  { title: "Write API docs", priority: "LOW", color: "bg-green-500/10 text-green-400", assignee: "A" },
                ]
              },
              {
                title: "In Progress", count: 2,
                tasks: [
                  { title: "Build Kanban drag and drop", priority: "MED", color: "bg-orange-500/10 text-orange-400", assignee: "T" },
                ]
              },
              {
                title: "In Review", count: 1,
                tasks: [
                  { title: "Socket.io real-time events", priority: "HIGH", color: "bg-red-500/10 text-red-400", assignee: "A" },
                ]
              },
              {
                title: "Done", count: 4,
                tasks: [
                  { title: "Database schema design", priority: "LOW", color: "bg-green-500/10 text-green-400", assignee: "T" },
                  { title: "JWT authentication", priority: "MED", color: "bg-orange-500/10 text-orange-400", assignee: "A" },
                ]
              },
            ].map((col) => (
              <div key={col.title} className="bg-[#111] p-4 min-h-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#666] text-[11px] font-medium uppercase tracking-widest">{col.title}</span>
                  <span className="text-[#333] text-[11px] bg-[#181818] px-2 py-0.5 rounded-full">{col.count}</span>
                </div>
                {col.tasks.map((task, i) => (
                  <div key={i} className="bg-[#181818] border border-white/6 rounded-lg p-2.5 mb-1.5 hover:border-[#7c3aed]/30 transition-colors">
                    <p className="text-[12px] text-white/80 mb-2 leading-snug">{task.title}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${task.color}`}>{task.priority}</span>
                      <div className="w-5 h-5 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-[9px] font-bold">{task.assignee}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="flex justify-center gap-20 py-14 border-t border-b border-white/6">
        {[
          { number: "∞", label: "Tasks per board" },
          { number: "⚡", label: "Real-time sync" },
          { number: "4", label: "Kanban columns" },
          { number: "$0", label: "Monthly cost" },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-4xl font-black text-white mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
              <span className="text-[#7c3aed]">{s.number}</span>
            </div>
            <div className="text-[#555] text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <section id="features" className="max-w-275 mx-auto px-10 py-24">
        <p className="text-[#7c3aed] text-xs font-medium uppercase tracking-widest text-center mb-4">Features</p>
        <h2 className="text-center font-black text-[clamp(28px,4vw,44px)] tracking-tight mb-14 leading-tight"
          style={{ fontFamily: "'Syne', sans-serif" }}>
          Everything your team needs.<br />Nothing you don't.
        </h2>

        <div className="grid grid-cols-3 gap-4">
          {[
            {
              title: "Real-time updates",
              desc: "Move a task and every teammate sees it instantly. No refresh. No lag. Built with Socket.io.",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              )
            },
            {
              title: "Kanban board",
              desc: "Drag and drop tasks across Todo, In Progress, In Review, and Done. Clean and fast.",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              )
            },
            {
              title: "Team workspaces",
              desc: "Invite teammates by email. Manage multiple workspaces with proper access control.",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              )
            },
            {
              title: "Task comments",
              desc: "Discuss work directly on tasks. Keep context where it belongs — next to the work itself.",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              )
            },
            {
              title: "Priority & due dates",
              desc: "Set deadlines and mark tasks as Low, Medium, or High priority. Know what needs attention first.",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              )
            },
            {
              title: "Task assignment",
              desc: "Assign tasks to specific team members. Everyone knows what they own.",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              )
            },
          ].map((f) => (
            <div key={f.title} className="bg-[#111] border border-white/[0.07] rounded-xl p-7 hover:border-[#7c3aed]/30 transition-colors">
              <div className="w-9 h-9 bg-[#7c3aed]/10 border border-[#7c3aed]/20 rounded-lg flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="text-white text-[15px] font-semibold mb-2">{f.title}</h3>
              <p className="text-[#666] text-[13px] leading-[1.65]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center px-10 py-28 relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-125 h-75 bg-[radial-gradient(ellipse_at_bottom,rgba(124,58,237,0.1)_0%,transparent_70%)] pointer-events-none" />
        <h2 className="font-black text-[clamp(32px,5vw,56px)] tracking-tight mb-5 leading-tight"
          style={{ fontFamily: "'Syne', sans-serif" }}>
          Ready to ship faster?
        </h2>
        <p className="text-[#666] text-base mb-9 font-light">Free to use. No credit card required.</p>
        <Link href="/signup" className="inline-block bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-8 py-4 rounded-xl text-[15px] font-medium transition-all hover:-translate-y-px">
          Create your workspace →
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/6 px-10 py-7 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#7c3aed] rounded-md flex items-center justify-center">
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="3" width="6" height="6" rx="1" fill="white" />
              <rect x="11" y="3" width="6" height="6" rx="1" fill="white" opacity="0.5" />
              <rect x="3" y="11" width="6" height="6" rx="1" fill="white" opacity="0.5" />
              <rect x="11" y="11" width="6" height="6" rx="1" fill="white" />
            </svg>
          </div>
          <span className="text-[#555] text-sm font-bold">DevBoard</span>
        </div>
        <p className="text-[#333] text-xs">Built by Tarjmul. All rights reserved.</p>
      </footer>

    </div>
  )
}