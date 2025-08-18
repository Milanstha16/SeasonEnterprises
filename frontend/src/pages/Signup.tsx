import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SignUp = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <Helmet>
        <title>Create Account - Season Enterprises</title>
        <meta
          name="description"
          content="Create a Season Enterprises account to enjoy faster checkout and order tracking."
        />
        <link rel="canonical" href="/signup" />
      </Helmet>

      <div className="w-full max-w-md px-6 py-10 border rounded-lg shadow-sm bg-white">
        <h1 className="font-display text-3xl mb-2 text-center">Create Account</h1>
        <p className="text-muted-foreground text-sm mb-6 text-center">
          Start your journey with handcrafted Nepali products.
        </p>

        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              className="w-full px-4 py-2 border rounded bg-muted text-sm"
              required
            />
          </div>

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
            Sign Up
          </Button>
        </form>

        <p className="mt-6 text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <Link to="/signin" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
};

export default SignUp;
