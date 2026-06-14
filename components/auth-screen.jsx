"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  KeyRound,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { APP_NAME } from "@/lib/constants";
import { BrandMark } from "@/components/brand-mark";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Field({ id, label, icon: Icon, children }) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-xs uppercase tracking-[0.18em] text-stone-500"
      >
        {label}
      </label>
      <div className="relative">
        {Icon ? (
          <Icon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
            strokeWidth={1.6}
            aria-hidden="true"
          />
        ) : null}
        {children}
      </div>
    </div>
  );
}

export function AuthScreen() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [unitInfo, setUnitInfo] = useState("");
  const [accessCode, setAccessCode] = useState("");

  function clearMessages() {
    if (error) setError("");
    if (success) setSuccess("");
  }

  function handleField(setter) {
    return (event) => {
      clearMessages();
      setter(event.target.value);
    };
  }

  function switchMode(login) {
    if (login === isLogin) return;
    setIsLogin(login);
    setError("");
    setSuccess("");
  }

  const requiredFilled = isLogin
    ? email.trim() && password.trim()
    : firstName.trim() &&
      lastName.trim() &&
      unitInfo.trim() &&
      accessCode.trim() &&
      email.trim() &&
      password.trim();

  const submitDisabled = loading || !requiredFilled;

  async function handleSignIn() {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError("No reconocemos esas credenciales. Revísalas e inténtalo de nuevo.");
      return;
    }

    router.push("/inicio");
    router.refresh();
  }

  async function handleRegister() {
    const code = accessCode.trim().toUpperCase();

    const { data: community, error: communityError } = await supabase
      .from("communities")
      .select("id, name")
      .eq("access_code", code)
      .maybeSingle();

    if (communityError) {
      setError("No hemos podido validar el código. Inténtalo de nuevo.");
      return;
    }

    if (!community) {
      setError("El código de acceso de la comunidad no es válido.");
      return;
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (signUpError) {
      const message = (signUpError.message || "").toLowerCase();
      if (message.includes("already") || message.includes("registered")) {
        setError("Este correo ya está registrado.");
      } else {
        setError("No hemos podido crear la cuenta. Inténtalo de nuevo.");
      }
      return;
    }

    const userId = signUpData.user?.id;
    if (!userId) {
      setError("No hemos podido crear la cuenta. Inténtalo de nuevo.");
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      unit_info: unitInfo.trim(),
      phone: null,
    });

    if (profileError) {
      setError(`No hemos podido completar tu perfil: ${profileError.message}`);
      return;
    }

    const { error: membershipError } = await supabase.from("memberships").insert({
      user_id: userId,
      community_id: community.id,
      role: "resident",
    });

    if (membershipError) {
      setError(`No hemos podido vincular tu comunidad: ${membershipError.message}`);
      return;
    }

    setSuccess("Cuenta creada. Te estamos llevando a tu comunidad…");
    router.push("/inicio");
    router.refresh();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitDisabled) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isLogin) {
        await handleSignIn();
      } else {
        await handleRegister();
      }
    } catch {
      setError("Ha ocurrido un error inesperado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const heading = isLogin ? "Bienvenido de nuevo" : "Únete a la comunidad";
  const subtitle = isLogin
    ? "Accede a las reservas de tu comunidad"
    : "Acceso reservado a residentes verificados";
  const submitLabel = loading
    ? isLogin
      ? "Accediendo…"
      : "Creando cuenta…"
    : isLogin
      ? "Iniciar sesión"
      : "Crear cuenta";
  const footerNote = isLogin
    ? "Acceso exclusivo para residentes de la comunidad"
    : "Verificamos cada alta con la administración de la finca";

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-stone-100 px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <BrandMark />
          <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
            {APP_NAME}
          </p>
        </div>

        <div className="mt-8 flex rounded-full bg-stone-50 p-1">
          <button
            type="button"
            onClick={() => switchMode(true)}
            aria-pressed={isLogin}
            className={cn(
              "flex-1 rounded-full px-4 py-2 text-sm transition-colors",
              isLogin
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-400 hover:text-stone-600"
            )}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => switchMode(false)}
            aria-pressed={!isLogin}
            className={cn(
              "flex-1 rounded-full px-4 py-2 text-sm transition-colors",
              !isLogin
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-400 hover:text-stone-600"
            )}
          >
            Crear cuenta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-8">
          <div
            key={isLogin ? "login" : "register"}
            className="space-y-5 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300"
          >
            <header className="space-y-1.5">
              <h1 className="font-serif text-2xl font-normal tracking-tight text-stone-900">
                {heading}
              </h1>
              <p className="text-sm text-stone-500">{subtitle}</p>
            </header>

            <div className="space-y-4">
              {!isLogin ? (
                <div className="grid grid-cols-2 gap-3">
                  <Field id="firstName" label="Nombre">
                    <Input
                      id="firstName"
                      type="text"
                      autoComplete="given-name"
                      value={firstName}
                      onChange={handleField(setFirstName)}
                    />
                  </Field>
                  <Field id="lastName" label="Apellidos">
                    <Input
                      id="lastName"
                      type="text"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={handleField(setLastName)}
                    />
                  </Field>
                </div>
              ) : null}

              {!isLogin ? (
                <Field id="unitInfo" label="Vivienda" icon={MapPin}>
                  <Input
                    id="unitInfo"
                    type="text"
                    className="pl-10"
                    placeholder="Portal 2, 3.º B"
                    value={unitInfo}
                    onChange={handleField(setUnitInfo)}
                  />
                </Field>
              ) : null}

              {!isLogin ? (
                <Field
                  id="accessCode"
                  label="Código de la comunidad"
                  icon={KeyRound}
                >
                  <Input
                    id="accessCode"
                    type="text"
                    className="pl-10 uppercase tracking-[0.12em]"
                    autoCapitalize="characters"
                    value={accessCode}
                    onChange={(event) => {
                      clearMessages();
                      setAccessCode(event.target.value.toUpperCase());
                    }}
                  />
                </Field>
              ) : null}

              <Field
                id="email"
                label={isLogin ? "Email" : "Correo electrónico"}
                icon={Mail}
              >
                <Input
                  id="email"
                  type="email"
                  className="pl-10"
                  autoComplete="email"
                  value={email}
                  onChange={handleField(setEmail)}
                />
              </Field>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs uppercase tracking-[0.18em] text-stone-500"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="pl-10 pr-10"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    value={password}
                    onChange={handleField(setPassword)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 transition-colors hover:text-stone-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
                    )}
                  </button>
                </div>
                {isLogin ? (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-xs text-stone-400 transition-colors hover:text-stone-600"
                    >
                      ¿Has olvidado tu contraseña?
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitDisabled}
              className="w-full rounded-xl"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : null}
              {submitLabel}
            </Button>

            {error ? (
              <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs text-red-800">
                <AlertCircle
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                <span>{error}</span>
              </div>
            ) : null}

            {success ? (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-900">
                <Check
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                <span>{success}</span>
              </div>
            ) : null}
          </div>
        </form>
      </div>

      <p className="mt-6 text-center text-xs text-stone-400">{footerNote}</p>
    </main>
  );
}
