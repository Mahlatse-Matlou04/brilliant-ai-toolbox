import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import logo from "@/assets/elfa-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { AI_DISCLAIMER } from "@/lib/tools";

export const Route = createFileRoute("/auth")({

  head: () => ({
    meta: [
      { title: "Sign in — ELFA Easy Learning For All" },
      {
        name: "description",
        content: "Sign in or create a free ELFA account to save your study chats and AI study outputs.",
      },
      { property: "og:title", content: "Sign in — ELFA" },
      { property: "og:description", content: "Create your free ELFA student account." },
    ],
  }),
  component: AuthPage,
});

const credentialsSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

function redirectParam() {
  if (typeof window === "undefined") return undefined;
  const stored = window.sessionStorage.getItem("elfa:redirect");
  window.sessionStorage.removeItem("elfa:redirect");
  return stored ?? undefined;
}

function safePath(value: string | undefined) {
  if (!value) return "/dashboard";
  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) return "/dashboard";
    return `${url.pathname}${url.search}`;
  } catch {
    return "/dashboard";
  }
}

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      void navigate({ href: safePath(redirectParam()), replace: true });
    }
  }, [loading, user, navigate]);

  const validate = () => {
    const parsed = credentialsSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your details");
      return null;
    }
    return parsed.data;
  };

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    const data = validate();
    if (!data) return;
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword(data);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back to ELFA");
  };

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    const data = validate();
    if (!data) return;
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      ...data,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: fullName.trim().slice(0, 100) },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created. Check your email if confirmation is required.");
  };

  const handleGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed. Please try email instead.");
      return;
    }
    if (result.redirected) return;
    void navigate({ href: safePath(redirectParam()), replace: true });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-hero-gradient p-10 text-primary-foreground lg:flex">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="" width={44} height={44} className="size-11" />
          <span className="font-display text-xl font-bold">ELFA</span>
        </Link>
        <div className="max-w-md space-y-4">
          <h1 className="font-display text-4xl font-bold leading-tight">
            Study support that teaches you, not for you.
          </h1>
          <p className="text-sm leading-relaxed text-primary-foreground/80">
            Built for South African learners, TVET and university students — homework guidance,
            summarised notes, realistic study plans and research briefs in one place.
          </p>
        </div>
        <p className="max-w-md text-xs leading-relaxed text-primary-foreground/70">{AI_DISCLAIMER}</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <img src={logo} alt="" width={40} height={40} className="size-10" />
            <span className="font-display text-xl font-bold">ELFA</span>
          </div>

          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="card-surface mt-4 space-y-4 p-6">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  Sign in
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="card-surface mt-4 space-y-4 p-6">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full name</Label>
                  <Input
                    id="signup-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    maxLength={100}
                    placeholder="Thandi Mokoena"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">At least 8 characters.</p>
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  Create free account
                </Button>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  By creating an account you agree to use ELFA honestly and accept that your
                  personal information is processed under POPIA as described on our{" "}
                  <Link to="/responsible-ai" className="font-medium text-primary underline">
                    Responsible AI page
                  </Link>
                  .
                </p>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={busy}>
            Continue with Google
          </Button>
        </div>
      </div>
    </div>
  );
}
