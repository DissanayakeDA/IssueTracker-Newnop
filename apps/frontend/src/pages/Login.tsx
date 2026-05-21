import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import Icon from "../components/common/Icon";
import loginIllustration from "../assets/illustrations/login.svg";

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!email.trim()) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    await login({ email, password });
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* ── Left: form panel ── */}
      <div className="flex-1 flex flex-col p-6 sm:p-10 lg:p-12 relative overflow-hidden">
        {/* Form */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md animate-fade-in-up">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Sign in to your account
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Enter your credentials to access your workspace.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
                <Icon name="error" className="text-base mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={formErrors.email}
                leftIcon={<Icon name="mail" className="text-lg" />}
              />

              <div>
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={formErrors.password}
                  leftIcon={<Icon name="lock" className="text-lg" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 transition-colors cursor-pointer focus:outline-none"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      <Icon
                        name={showPassword ? "visibility_off" : "visibility"}
                        className="text-lg"
                      />
                    </button>
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  Remember me for 30 days
                </label>
                <a
                  href="#"
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                loading={loading}
                size="lg"
                className="w-full mt-2"
              >
                {loading ? "Signing in…" : "Sign In"}
                {!loading && (
                  <Icon name="arrow_forward" className="ml-1.5 text-base" />
                )}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-gray-400">
              <div className="flex-1 h-px bg-gray-200" />
              <span>or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <p className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-indigo-600 hover:text-indigo-500 inline-flex items-center gap-0.5"
              >
                Create one
                <Icon name="arrow_forward" className="text-sm" />
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
      </div>

      {/* ── Right: illustration panel ── */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 via-violet-50 to-indigo-100">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-300/40 blur-3xl animate-blob" />
        <div
          className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-violet-300/40 blur-3xl animate-blob"
          style={{ animationDelay: "3s" }}
        />
        <div
          className="absolute top-1/3 right-1/4 h-48 w-48 rounded-full bg-sky-200/40 blur-3xl animate-blob"
          style={{ animationDelay: "6s" }}
        />

        {/* Subtle grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center px-12 max-w-xl">
          <img
            src={loginIllustration}
            alt="Login illustration"
            className="w-full max-w-md drop-shadow-xl"
          />
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Track issues. Ship faster.
            </h2>
            <p className="mt-2 text-sm text-gray-600 max-w-sm mx-auto">
              Organize, prioritize, and resolve every bug with a workspace built
              for modern teams.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-sm">
            {[
              { icon: "bolt", label: "Fast" },
              { icon: "verified", label: "Reliable" },
              { icon: "lock", label: "Secure" },
            ].map((f) => (
              <div
                key={f.label}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/80 shadow-sm"
              >
                <Icon name={f.icon} className="text-indigo-600 text-lg" />
                <span className="text-xs font-medium text-gray-700">
                  {f.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
