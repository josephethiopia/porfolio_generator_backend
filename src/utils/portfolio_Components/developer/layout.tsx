import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sun } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <header className="container mx-auto px-4 py-6">
                <nav className="flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold">
                        {'<SS />'}
                    </Link>
                    <div className="flex items-center gap-8">
                        <Link href="#about" className="text-sm hover:text-gray-300">
                            About
                        </Link>
                        <Link href="#work" className="text-sm hover:text-gray-300">
                            Work
                        </Link>
                        <Link href="#testimonials" className="text-sm hover:text-gray-300">
                            Testimonials
                        </Link>
                        <Link href="#contact" className="text-sm hover:text-gray-300">
                            Contact
                        </Link>
                        <Button variant="ghost" size="icon" className="text-gray-300">
                            <Sun className="h-5 w-5" />
                        </Button>
                        <Button className="bg-white text-black hover:bg-gray-200">
                            Download CV
                        </Button>
                    </div>
                </nav>
            </header>
            <main>
                {children}
            </main>
        </div>
    );
}