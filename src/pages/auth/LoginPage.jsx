import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/store/authStore.js";
import { users } from "@/mocks/fixtures/users.fixtures.js";
import { Flame } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils.js";

const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(6, "Mot de passe: minimum 6 caractères"),
});

const DEMO_ACCOUNTS = [
  { label: "Admin", email: "ahmed.boudiaf@sonatrach.dz" },
  { label: "Superviseur", email: "fatima.zeroual@sonatrach.dz" },
  { label: "Technicien", email: "aisha.sellal@sonatrach.dz" },
  { label: "Utilisateur", email: "sara.hamrouche@sonatrach.dz" },
];

export default function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [errorShake, setErrorShake] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      const result = await res.json();

      if (result.success) {
        login(result.user, result.token);
        navigate("/dashboard");
      } else {
        setErrorShake(true);
        setTimeout(() => setErrorShake(false), 500);
      }
    } catch (err) {
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
    }
  };

  const handleDemoClick = (email) => {
    setValue("email", email);
    setValue("password", "sigma2024");
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 bg-dark-surface relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#144F2B] to-[#0D1117] opacity-80" />
          {/* Decorative shapes */}
          <div className="absolute top-[-20%] right-[-10%] w-[80%] aspect-square rounded-full bg-sonatrach-green/10 blur-3xl" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[60%] aspect-square rounded-full bg-sonatrach-gold/10 blur-3xl" />
        </div>

        <div className="z-10 text-white">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded bg-sonatrach-green flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-display font-bold tracking-wider">
              SONATRACH
            </span>
          </div>

          <h1 className="text-5xl font-display font-bold mb-6 leading-tight">
            Système Intégré de Gestion
            <br />
            du Matériel Informatique
          </h1>
          <p className="text-lg text-gray-400 max-w-md font-light">
            Gérez l'ensemble du cycle de vie du parc informatique, des logiciels
            et de la maintenance avec précision et efficacité.
          </p>
        </div>

        <div className="z-10 text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Sonatrach. Tous droits réservés.
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          className="w-full max-w-md"
          animate={errorShake ? { x: [0, -8, 8, -8, 8, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded bg-sonatrach-green flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-display font-bold tracking-wider">
              SONATRACH
            </span>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-display font-bold mb-2">
              Connexion à SIGMA
            </h2>
            <p className="text-sm text-[var(--color-muted)] mb-8">
              Veuillez vous authentifier pour accéder à votre espace.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Adresse Email
                </label>
                <input
                  {...register("email")}
                  type="email"
                  className={cn(
                    "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sonatrach-green/20 bg-transparent",
                    errors.email
                      ? "border-red-500"
                      : "border-[var(--color-border)]",
                  )}
                  placeholder="nom.prenom@sonatrach.dz"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Mot de passe
                </label>
                <input
                  {...register("password")}
                  type="password"
                  className={cn(
                    "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sonatrach-green/20 bg-transparent",
                    errors.password
                      ? "border-red-500"
                      : "border-[var(--color-border)]",
                  )}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between py-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-sonatrach-green focus:ring-sonatrach-green/20"
                  />
                  <span className="text-sm text-[var(--color-muted)]">
                    Se souvenir de moi
                  </span>
                </label>
                <a
                  href="#"
                  className="text-sm text-sonatrach-green hover:underline"
                >
                  Mot de passe oublié ?
                </a>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-sonatrach-green hover:bg-sonatrach-green-light text-white rounded-md font-medium transition-colors"
              >
                Se connecter
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
              <p className="text-xs text-[var(--color-muted)] mb-3 uppercase tracking-wider font-semibold">
                Comptes de test (cliquez pour remplir)
              </p>
              <div className="flex flex-wrap gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => handleDemoClick(acc.email)}
                    type="button"
                    className="px-2.5 py-1 text-xs rounded border border-[var(--color-border)] hover:border-sonatrach-green hover:bg-sonatrach-green/5 transition-colors"
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-3">
                Mot de passe pour tous : <code>sigma2024</code>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
