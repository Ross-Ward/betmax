import Link from "next/link"
import { Search } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
                <div className="mr-4 hidden md:flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <span className="hidden font-bold sm:inline-block text-xl">
                            BetMax
                        </span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <Link
                            href="/live"
                            className="transition-colors hover:text-primary font-bold text-foreground"
                        >
                            Live Streams
                        </Link>
                        <Link
                            href="/betting"
                            className="transition-colors hover:text-primary font-bold text-foreground"
                        >
                            Betting
                        </Link>
                        <Link
                            href="/stats"
                            className="transition-colors hover:text-primary font-bold text-foreground"
                        >
                            Stats Hub
                        </Link>
                        <div className="h-4 w-px bg-border mx-2" />
                        <Link
                            href="/live?sport=Boxing"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            Boxing
                        </Link>
                        <Link
                            href="/live?sport=MMA"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            UFC
                        </Link>
                        <Link
                            href="/live?sport=Basketball"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            NBA
                        </Link>
                        <Link
                            href="/live?sport=Football"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            Soccer
                        </Link>
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search events..."
                                className="pl-8 md:w-[300px] lg:w-[300px]"
                            />
                        </div>
                    </div>
                    <nav className="flex items-center">
                        <ThemeToggle />
                        <Button variant="default" size="sm" className="ml-4">
                            Login
                        </Button>
                    </nav>
                </div>
            </div>
        </header>
    )
}
