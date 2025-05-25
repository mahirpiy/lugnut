// src/app/page.tsx
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3, Car, Shield, Wrench } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-stone-600" />
              <span className="font-bold text-xl">Lugnut</span>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-foreground mb-6">
              Track Every Detail of Your Vehicle Maintenance
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Whether you wrench on weekends or just want to treat your car
              right, Lugnut helps you track every service, part, and upgrade —
              down to the bolt. Know exactly what you&apos;ve done, when you did
              it, and what&apos;s due next.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/auth/signup">Start Tracking Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-background">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              Why Choose Lugnut?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="text-center">
                  <Wrench className="h-12 w-12 mx-auto mb-4" />
                  <CardTitle>Granular Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Track individual components like spark plugs, filters, and
                    fluids separately within each maintenance job.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <Car className="h-12 w-12 mx-auto mb-4" />
                  <CardTitle>Job-Based Organization</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Group related work into jobs and then break down every
                    detail - from oil changes to spark plugs - within each
                    service record.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                  <CardTitle>Cost Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Track parts costs and labor expenses to understand your
                    total maintenance investment over time.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <Shield className="h-12 w-12 mx-auto mb-4" />
                  <CardTitle>Your Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Your maintenance records belong to you. Simple, secure,
                    always exportable.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Example Section */}
        <section className="py-16 px-4 bg-background">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-foreground mb-8">
              See How It Works
            </h2>
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Job: Spark Plugs & Wires</CardTitle>
                <CardDescription>
                  2024-09-13 • 45,230 miles • Joe&apos;s Garage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-2 pl-4">
                  <h4 className="font-medium">Record: Spark Plugs</h4>
                  <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                    <li>• 6x NGK Iridium IX Plugs - $48.99</li>
                    <li>• Anti-seize compound - $8.99</li>
                  </ul>
                </div>
                <div className="border-l-2 pl-4">
                  <h4 className="font-medium">Record: Spark Plug Wires</h4>
                  <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                    <li>• NGK Wire Set - $89.99</li>
                    <li>• Dielectric grease - $6.99</li>
                  </ul>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium">
                    Total Parts: $154.96 • Labor: $120.00 • Job Total: $274.96
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-background text-foreground">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Start Tracking?
            </h2>
            <p className="text-xl mb-8 text-foreground">
              Join DIY mechanics who trust Lugnut to keep detailed maintenance
              records.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/signup">Get Started Free</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background text-foreground py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Car className="h-6 w-6" />
            <span className="font-bold">Lugnut</span>
          </div>
          <p className="text-muted-foreground">
            © 2025 Overbrook Holdings LLC. Built for DIY mechanics who care
            about the details.
          </p>
        </div>
      </footer>
    </div>
  );
}
