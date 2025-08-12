import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SignIn = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <Helmet>
        <title>Sign In - Season Enterprises</title>
        <meta
          name="description"
          content="Sign in to your Season Enterprises account to access your orders and profile."
        />
        <link rel="canonical" href="/signin" />
      </Helmet>

      <div className="w-full max-w-md px-6 py-10 border rounded-lg shadow-sm bg-white">
        <h1 className="font-display text-3xl mb-2 text-center">Welcome Back</h1>
        <p className="text-muted-foreground text-sm mb-6 text-center">
          Sign in to continue shopping.
        </p>

        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email address
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 border rounded bg-muted text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border rounded bg-muted text-sm"
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-sm text-center text-muted-foreground">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline">
            Create one here
          </Link>
        </p>
      </div>
    </main>
  );
};

export default SignIn;
