import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
      <form
        action={async (formData) => {
          "use server";

          await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirectTo: "/dashboard",
          });
        }}
        className="w-full max-w-sm space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6"
      >
        <div>
          <h1 className="text-2xl font-bold">
            Entrar
          </h1>

          <p className="mt-1 text-sm text-zinc-400">
            Dota Team Platform
          </p>
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm"
          >
            E-mail
          </label>

          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm"
          >
            Senha
          </label>

          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-white px-4 py-2 font-medium text-black"
        >
          Entrar
        </button>
      </form>
    </main>
  );
}