export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Welcome to your React App
        </h1>
        <p className="text-lg text-muted-foreground">
          Your app is up and running. Tell me what you'd like to build and I'll get started.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <div className="rounded-lg border bg-card p-6 text-left w-64 shadow-sm">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold text-card-foreground mb-1">React + Vite</h3>
            <p className="text-sm text-muted-foreground">Fast development with hot module replacement</p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-left w-64 shadow-sm">
            <div className="text-2xl mb-2">🎨</div>
            <h3 className="font-semibold text-card-foreground mb-1">Tailwind CSS</h3>
            <p className="text-sm text-muted-foreground">Utility-first styling with a full component library</p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-left w-64 shadow-sm">
            <div className="text-2xl mb-2">🔗</div>
            <h3 className="font-semibold text-card-foreground mb-1">API Ready</h3>
            <p className="text-sm text-muted-foreground">Express backend with OpenAPI codegen built in</p>
          </div>
        </div>
      </div>
    </div>
  );
}
