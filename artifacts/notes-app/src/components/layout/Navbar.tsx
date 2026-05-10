import { useClerk, useUser } from "@clerk/react";
import { Link, useLocation } from "wouter";
import { LogOut, Plus, BookText, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [location, setLocation] = useLocation();

  const isAdmin = user?.publicMetadata?.role === "admin";

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{ background: "rgba(15,12,41,0.7)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(168,85,247,0.15)" }}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo + nav */}
        <div className="flex gap-8 items-center">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #a855f7, #3b82f6)", boxShadow: "0 0 14px rgba(168,85,247,0.5)" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                <path d="M2 2l7.5 1.5"/>
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight" style={{ background: "linear-gradient(135deg, #fff, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              NoteFlow
            </span>
          </Link>

          <nav className="hidden md:flex gap-1">
            <Link href="/notes">
              <span
                className="px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer"
                style={location === "/notes" || location.startsWith("/notes")
                  ? { background: "rgba(168,85,247,0.2)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.3)" }
                  : { color: "rgba(255,255,255,0.55)", border: "1px solid transparent" }}
              >
                My Notes
              </span>
            </Link>
            {isAdmin && (
              <Link href="/admin">
                <span
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer"
                  style={location === "/admin"
                    ? { background: "rgba(236,72,153,0.2)", color: "#f472b6", border: "1px solid rgba(236,72,153,0.3)" }
                    : { color: "rgba(255,255,255,0.55)", border: "1px solid transparent" }}
                >
                  Admin
                </span>
              </Link>
            )}
          </nav>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <Link href="/notes/new">
            <button
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)", boxShadow: "0 0 18px rgba(168,85,247,0.4)" }}
            >
              <Plus className="h-4 w-4" />
              New Note
            </button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative h-9 w-9 rounded-full transition-transform hover:scale-105" style={{ outline: "2px solid rgba(168,85,247,0.4)", outlineOffset: 2 }}>
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.imageUrl} alt={user?.fullName || ""} />
                  <AvatarFallback style={{ background: "linear-gradient(135deg, #a855f7, #3b82f6)", color: "white", fontWeight: 700 }}>
                    {user?.firstName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56"
              align="end"
              forceMount
              style={{ background: "rgba(30,20,60,0.95)", border: "1px solid rgba(168,85,247,0.25)", backdropFilter: "blur(16px)", color: "white" }}
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold text-white">{user?.fullName}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator style={{ background: "rgba(168,85,247,0.2)" }} />
              <DropdownMenuItem asChild>
                <Link href="/notes" className="cursor-pointer w-full flex items-center" style={{ color: "rgba(255,255,255,0.8)" }}>
                  <BookText className="mr-2 h-4 w-4 text-purple-400" />
                  <span>My Notes</span>
                </Link>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="cursor-pointer w-full flex items-center" style={{ color: "rgba(255,255,255,0.8)" }}>
                    <ShieldAlert className="mr-2 h-4 w-4 text-pink-400" />
                    <span>Admin Panel</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator style={{ background: "rgba(168,85,247,0.2)" }} />
              <DropdownMenuItem
                onClick={() => signOut(() => setLocation("/"))}
                className="cursor-pointer"
                style={{ color: "#f87171" }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
