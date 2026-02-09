import { ArrowRight, Shield, Zap, BarChart3, ChevronRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">MOC Studio</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
            <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
          </div>

          <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center py-24 md:py-32 px-6">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Zap className="h-3 w-3" />
            Industrial Change Management Platform
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
            Engineer Change.
            <br />
            <span className="text-muted-foreground">Govern Risk.</span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
            A rigorous framework for managing industrial change — from risk assessment 
            to compliance audit trails. Built for engineers who demand precision.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
              Start Managing Changes
              <ArrowRight className="h-4 w-4" />
            </button>
            <button className="flex items-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors">
              View Documentation
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border py-24 px-6">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-16">
            Everything you need for MOC governance
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Risk Matrix",
                description: "Quantitative probability vs severity assessment with automated governance rules.",
              },
              {
                icon: BarChart3,
                title: "Real-time Dashboard",
                description: "Monitor active MOCs, critical risks, and system health at a glance.",
              },
              {
                icon: Zap,
                title: "AI-Powered Analysis",
                description: "Leverage AI for technical assessments and engineering advisory support.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-lg border border-border bg-card p-6 space-y-3 hover:border-primary/30 transition-colors"
              >
                <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
              <Shield className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">MOC Studio</span>
          </div>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} MOC Studio. All rights reserved.
          </p>

          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
