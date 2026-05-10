import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { BookText, PenTool, Lock, Share2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl space-y-8"
        >
          <div className="mx-auto w-16 h-16 bg-primary/10 flex items-center justify-center rounded-2xl mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
              <path d="M12 19l7-7 3 3-7 7-3-3z"/>
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
              <path d="M2 2l7.5 1.5"/>
            </svg>
          </div>
          <h1 className="text-5xl sm:text-7xl font-serif font-bold tracking-tight text-foreground">
            A quiet place for your loudest ideas.
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            NoteFlow is a personal workspace that feels like a real notebook. Fast, elegant, and perfectly balanced for deep focus.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full" asChild>
              <Link href="/sign-up">
                Start Writing <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="bg-secondary/30 border-t py-24">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <FeatureCard 
              icon={<PenTool className="h-6 w-6" />}
              title="Fluid Writing"
              description="A deeply satisfying editor that stays out of your way so you can focus on your thoughts."
              delay={0.1}
            />
            <FeatureCard 
              icon={<BookText className="h-6 w-6" />}
              title="Organized Chaos"
              description="Tag, pin, and search instantly. Find any note in milliseconds."
              delay={0.2}
            />
            <FeatureCard 
              icon={<Lock className="h-6 w-6" />}
              title="Private by Default"
              description="Your notes belong to you. Secure, private, and inaccessible to anyone else."
              delay={0.3}
            />
            <FeatureCard 
              icon={<Share2 className="h-6 w-6" />}
              title="Ready to Share"
              description="Keep it private or publish it to the world. You control your notebook."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>Built with craft and care. NoteFlow &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center text-center p-6 space-y-4"
    >
      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-serif font-semibold">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}
