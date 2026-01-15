import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, BarChart3, Users, Mail } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function HomePage() {
  return (
    <div className="flex w-full items-center  flex-col px-4 md:px-8">
      <header className="container flex h-16 items-center justify-between border-b">
        <div className="flex items-center gap-5">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">PCRM</span>
          </div>
          <span className="text-lg font-semibold">Project/Client Manager</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button variant="ghost" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="container flex flex-col items-center justify-center gap-8 py-24 text-center">
          <div className="flex max-w-3xl flex-col gap-4">
            <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-6xl">
              Manage your clients with confidence
            </h1>
            <p className="text-pretty text-lg text-muted-foreground sm:text-xl">
              A powerful CRM built for teams. Track clients, manage activities,
              and send personalized emails all in one place.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">
                Get started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </section>

        <section className="border-t bg-muted/50 py-24">
          <div className="container">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Users className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Client Management</h3>
                  <p className="text-muted-foreground">
                    Organize and track all your clients in one centralized
                    location with detailed profiles and history.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Analytics Dashboard</h3>
                  <p className="text-muted-foreground">
                    Get insights into your client base with detailed analytics
                    and reporting on key metrics.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Mail className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Email Templates</h3>
                  <p className="text-muted-foreground">
                    Create and use customizable email templates to streamline
                    your client communications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container flex items-center justify-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Bestcircle.ai. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
