import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { BookText, PenTool, Lock, Share2, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-[100dvh] overflow-x-hidden" style={{ background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}>

      {/* Floating orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div style={{ position: "absolute", top: "-10%", left: "-5%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", top: "30%", right: "-10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "5%", left: "20%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.18) 0%, transparent 70%)" }} />
      </div>

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-4 py-24 sm:py-36">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4"
            style={{ background: "rgba(168,85,247,0.2)", border: "1px solid rgba(168,85,247,0.4)", color: "#d8b4fe" }}
          >
            <Sparkles className="h-4 w-4" />
            Your personal thinking space
          </motion.div>

          {/* Logo icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="mx-auto w-20 h-20 flex items-center justify-center rounded-2xl mb-6"
            style={{ background: "linear-gradient(135deg, #a855f7, #3b82f6)", boxShadow: "0 0 40px rgba(168,85,247,0.5)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10">
              <path d="M12 19l7-7 3 3-7 7-3-3z"/>
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
              <path d="M2 2l7.5 1.5"/>
            </svg>
          </motion.div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight" style={{ background: "linear-gradient(135deg, #fff 30%, #c084fc 70%, #60a5fa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            A quiet place for your loudest ideas.
          </h1>

          <p className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
            NoteFlow is a personal workspace that feels like a real notebook. Fast, elegant, and perfectly balanced for deep focus.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link href="/sign-up">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-8 py-4 rounded-full text-lg font-semibold text-white cursor-pointer"
                style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)", boxShadow: "0 0 30px rgba(168,85,247,0.5)" }}
              >
                Start Writing <ArrowRight className="h-5 w-5" />
              </motion.button>
            </Link>
            <Link href="/sign-in">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-8 py-4 rounded-full text-lg font-semibold cursor-pointer"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)" }}
              >
                Sign In
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex items-center justify-center gap-12 mt-20"
        >
          {[
            { value: "10x", label: "Faster than paper" },
            { value: "∞", label: "Notes, forever" },
            { value: "100%", label: "Private & secure" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold" style={{ background: "linear-gradient(135deg, #c084fc, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{stat.value}</div>
              <div className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="relative py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Everything you need to think clearly</h2>
            <p style={{ color: "rgba(255,255,255,0.5)" }}>Powerful features wrapped in a calm, focused interface.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<PenTool className="h-6 w-6" />}
              title="Fluid Writing"
              description="A deeply satisfying editor that stays out of your way so you can focus on your thoughts."
              gradient="linear-gradient(135deg, #a855f7, #7c3aed)"
              glow="rgba(168,85,247,0.3)"
              delay={0.1}
            />
            <FeatureCard
              icon={<BookText className="h-6 w-6" />}
              title="Organized Chaos"
              description="Tag, pin, and search instantly. Find any note in milliseconds."
              gradient="linear-gradient(135deg, #3b82f6, #06b6d4)"
              glow="rgba(59,130,246,0.3)"
              delay={0.2}
            />
            <FeatureCard
              icon={<Lock className="h-6 w-6" />}
              title="Private by Default"
              description="Your notes belong to you. Secure, private, and inaccessible to anyone else."
              gradient="linear-gradient(135deg, #ec4899, #f43f5e)"
              glow="rgba(236,72,153,0.3)"
              delay={0.3}
            />
            <FeatureCard
              icon={<Share2 className="h-6 w-6" />}
              title="Ready to Share"
              description="Keep it private or publish it to the world. You control your notebook."
              gradient="linear-gradient(135deg, #10b981, #059669)"
              glow="rgba(16,185,129,0.3)"
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center rounded-3xl p-12"
          style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(59,130,246,0.2))", border: "1px solid rgba(168,85,247,0.3)", backdropFilter: "blur(12px)" }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to start writing?</h2>
          <p className="mb-8" style={{ color: "rgba(255,255,255,0.6)" }}>Join thousands of thinkers, writers, and creators.</p>
          <Link href="/sign-up">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full text-lg font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #a855f7, #3b82f6)", boxShadow: "0 0 40px rgba(168,85,247,0.4)" }}
            >
              Get Started Free <ArrowRight className="h-5 w-5" />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 text-center text-sm" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" }}>
        <p>Built with craft and care. NoteFlow &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon, title, description, gradient, glow, delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  glow: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
      className="flex flex-col p-6 rounded-2xl space-y-4"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
        style={{ background: gradient, boxShadow: `0 8px 24px ${glow}` }}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{description}</p>
    </motion.div>
  );
}
