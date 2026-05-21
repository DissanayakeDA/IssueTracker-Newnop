import { useState, FormEvent, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import Icon from "../components/common/Icon";
import registerIllustration from "../assets/illustrations/register.svg";

interface PasswordCheck {
  label: string;
  test: (pw: string) => boolean;
}

const passwordChecks: PasswordCheck[] = [
  { label: "At least 9 characters", test: (pw) => pw.length >= 9 },
  { label: "One uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
  { label: "One number", test: (pw) => /[0-9]/.test(pw) },
  { label: "One symbol", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

const strengthMeta = [
  { label: "Too weak", color: "bg-red-500", text: "text-red-600" },
  { label: "Weak", color: "bg-orange-500", text: "text-orange-600" },
  { label: "Fair", color: "bg-amber-500", text: "text-amber-600" },
  { label: "Good", color: "bg-lime-500", text: "text-lime-600" },
  { label: "Strong", color: "bg-emerald-500", text: "text-emerald-600" },
];

export default function Register() {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const strengthScore = useMemo(
    () =>
      passwordChecks.reduce((acc, c) => acc + (c.test(password) ? 1 : 0), 0),
    [password],
  );
  const strength = strengthMeta[strengthScore];

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Name is required";
    if (!email.trim()) errors.email = "Email is required";
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 9) {
      errors.password = "Password must be more than 8 characters";
    } else if (!/[A-Z]/.test(password)) {
      errors.password = "Password must contain at least one uppercase letter";
    } else if (!/[0-9]/.test(password)) {
      errors.password = "Password must contain at least one number";
    } else if (!/[^A-Za-z0-9]/.test(password)) {
      errors.password = "Password must contain at least one symbol";
    }
    if (password !== confirmPassword)
      errors.confirmPassword = "Passwords do not match";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    await register({ name, email, password });
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
                Create your account
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Sign up in seconds to start tracking issues with your team.
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
                label="Full Name"
                autoComplete="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={formErrors.name}
                leftIcon={<Icon name="person" className="text-lg" />}
              />

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
                  autoComplete="new-password"
                  placeholder="Create a strong password"
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

                {/* Strength meter */}
                {password.length > 0 && (
                  <div className="mt-2.5">
                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            i < strengthScore ? strength.color : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p
                      className={`mt-1.5 text-xs font-medium ${strength.text}`}
                    >
                      Password strength: {strength.label}
                    </p>

                    {/* Requirement checklist */}
                    <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                      {passwordChecks.map((c) => {
                        const ok = c.test(password);
                        return (
                          <li
                            key={c.label}
                            className={`flex items-center gap-1.5 text-xs transition-colors ${
                              ok ? "text-emerald-600" : "text-gray-500"
                            }`}
                          >
                            <Icon
                              name={
                                ok ? "check_circle" : "radio_button_unchecked"
                              }
                              className="text-sm"
                              filled={ok}
                            />
                            {c.label}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>

              <Input
                label="Confirm Password"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={formErrors.confirmPassword}
                leftIcon={<Icon name="lock" className="text-lg" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 transition-colors cursor-pointer focus:outline-none"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    <Icon
                      name={showConfirm ? "visibility_off" : "visibility"}
                      className="text-lg"
                    />
                  </button>
                }
              />

              <p className="text-xs text-gray-500 leading-relaxed">
                By creating an account, you agree to our{" "}
                <a
                  href="#"
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Privacy Policy
                </a>
                .
              </p>

              <Button
                type="submit"
                loading={loading}
                size="lg"
                className="w-full mt-1"
              >
                {loading ? "Creating account…" : "Create Account"}
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
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-500 inline-flex items-center gap-0.5"
              >
                Sign in
                <Icon name="arrow_forward" className="text-sm" />
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ── Right: illustration panel ── */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden bg-gradient-to-br from-violet-50 via-indigo-50 to-sky-100">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-violet-300/40 blur-3xl animate-blob" />
        <div
          className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-indigo-300/40 blur-3xl animate-blob"
          style={{ animationDelay: "3s" }}
        />
        <div
          className="absolute top-1/3 left-1/4 h-48 w-48 rounded-full bg-sky-200/40 blur-3xl animate-blob"
          style={{ animationDelay: "6s" }}
        />

        {/* Subtle grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center px-12 max-w-xl">
          <img
            src={registerIllustration}
            alt="Register illustration"
            className="w-full max-w-md drop-shadow-xl"
          />
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Build better software, together.
            </h2>
            <p className="mt-2 text-sm text-gray-600 max-w-sm mx-auto">
              Join thousands of teams using IssueTracker to capture, triage, and
              resolve issues in one place.
            </p>
          </div>

          <ul className="mt-8 w-full max-w-sm space-y-2.5">
            {[
              "Unlimited projects and issues",
              "Powerful filters, search & exports",
              "Free for small teams — forever",
            ].map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/80 shadow-sm"
              >
                <span className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Icon name="check" className="text-emerald-600 text-sm" />
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
