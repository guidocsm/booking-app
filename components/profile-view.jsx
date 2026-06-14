"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateProfileAction } from "@/app/(app)/perfil/actions";

function Field({ id, label, icon: Icon, helper, children }) {
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
      {helper ? <p className="text-xs text-stone-400">{helper}</p> : null}
    </div>
  );
}

function SuccessNote({ children }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-900">
      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

function ErrorNote({ children }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs text-red-800">
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

export function ProfileView({ userId, email, accessCode, profile }) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [saved, setSaved] = useState(profile);
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [phone, setPhone] = useState(profile.phone);
  const [unitInfo, setUnitInfo] = useState(profile.unitInfo);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [signingOut, setSigningOut] = useState(false);

  const dirty =
    firstName !== saved.firstName ||
    lastName !== saved.lastName ||
    unitInfo !== saved.unitInfo ||
    phone !== saved.phone;

  const requiredFilled =
    firstName.trim() && lastName.trim() && unitInfo.trim();

  const initials = `${(saved.firstName || "").charAt(0)}${(saved.lastName || "").charAt(0)}`.toUpperCase();
  const fullName = `${saved.firstName} ${saved.lastName}`.trim();

  function updateProfileField(setter) {
    return (event) => {
      setSaveError("");
      setSaveSuccess("");
      setter(event.target.value);
    };
  }

  async function handleSave(event) {
    event.preventDefault();
    if (!dirty || !requiredFilled || saving) return;

    setSaving(true);
    setSaveError("");
    setSaveSuccess("");

    const trimmedPhone = phone.trim();

    const result = await updateProfileAction({
      firstName,
      lastName,
      unitInfo,
      phone,
    });

    setSaving(false);

    if (result?.error) {
      setSaveError("No hemos podido guardar los cambios. Inténtalo de nuevo.");
      return;
    }

    const nextSaved = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      unitInfo: unitInfo.trim(),
      phone: trimmedPhone,
    };
    setFirstName(nextSaved.firstName);
    setLastName(nextSaved.lastName);
    setUnitInfo(nextSaved.unitInfo);
    setPhone(nextSaved.phone);
    setSaved(nextSaved);
    setSaveSuccess("Cambios guardados.");
    router.refresh();
  }

  async function handlePasswordChange(event) {
    event.preventDefault();
    if (savingPassword) return;

    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (newPassword !== repeatPassword) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }

    setSavingPassword(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    setSavingPassword(false);

    if (error) {
      const message = (error.message || "").toLowerCase();
      if (
        message.includes("reauth") ||
        message.includes("again") ||
        message.includes("session") ||
        message.includes("recent")
      ) {
        setPasswordError(
          "Por seguridad, vuelve a iniciar sesión para cambiar tu contraseña."
        );
      } else if (
        message.includes("different") ||
        message.includes("should be")
      ) {
        setPasswordError("La nueva contraseña debe ser diferente de la actual.");
      } else {
        setPasswordError(
          "No hemos podido actualizar la contraseña. Inténtalo de nuevo."
        );
      }
      return;
    }

    setNewPassword("");
    setRepeatPassword("");
    setPasswordSuccess("Contraseña actualizada.");
  }

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-900">
          <span className="font-serif text-xl font-normal leading-none text-white">
            {initials}
          </span>
        </span>
        <div className="space-y-1">
          <h1 className="font-serif text-2xl font-normal tracking-tight text-stone-900">
            {fullName}
          </h1>
          {saved.unitInfo ? (
            <p className="text-sm text-stone-400">{saved.unitInfo}</p>
          ) : null}
        </div>
      </header>

      <form onSubmit={handleSave}>
        <div className="space-y-5 rounded-3xl border border-stone-200 bg-white p-6">
          <Field id="firstName" label="Nombre">
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={updateProfileField(setFirstName)}
            />
          </Field>

          <Field id="lastName" label="Apellidos">
            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={updateProfileField(setLastName)}
            />
          </Field>

          <Field id="phone" label="Teléfono (opcional)">
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={updateProfileField(setPhone)}
            />
          </Field>

          <Field id="unitInfo" label="Vivienda">
            <Input
              id="unitInfo"
              type="text"
              value={unitInfo}
              onChange={updateProfileField(setUnitInfo)}
            />
          </Field>

          <Field
            id="email"
            label="Correo electrónico"
            icon={Mail}
            helper="No se puede modificar"
          >
            <Input
              id="email"
              type="email"
              className="bg-stone-50 pl-10 text-stone-500"
              value={email}
              disabled
            />
          </Field>

          <Field
            id="accessCode"
            label="Código de la comunidad"
            icon={KeyRound}
            helper="Asignado por tu comunidad"
          >
            <Input
              id="accessCode"
              type="text"
              className="bg-stone-50 pl-10 uppercase tracking-[0.12em] text-stone-500"
              value={accessCode}
              disabled
            />
          </Field>

          {saveError ? <ErrorNote>{saveError}</ErrorNote> : null}
          {saveSuccess ? <SuccessNote>{saveSuccess}</SuccessNote> : null}

          <Button
            type="submit"
            disabled={!dirty || !requiredFilled || saving}
            className="w-full rounded-xl"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : null}
            {saving ? "Guardando…" : "Guardar cambios"}
          </Button>
        </div>
      </form>

      <form onSubmit={handlePasswordChange}>
        <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="font-serif text-xl font-normal tracking-tight text-stone-900">
            Contraseña
          </h2>

          <div className="space-y-1.5">
            <label
              htmlFor="newPassword"
              className="block text-xs uppercase tracking-[0.18em] text-stone-500"
            >
              Nueva contraseña
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                strokeWidth={1.6}
                aria-hidden="true"
              />
              <Input
                id="newPassword"
                type={showNew ? "text" : "password"}
                className="pl-10 pr-10"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => {
                  setPasswordError("");
                  setPasswordSuccess("");
                  setNewPassword(event.target.value);
                }}
              />
              <button
                type="button"
                onClick={() => setShowNew((value) => !value)}
                aria-label={showNew ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 transition-colors hover:text-stone-600"
              >
                {showNew ? (
                  <EyeOff className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="repeatPassword"
              className="block text-xs uppercase tracking-[0.18em] text-stone-500"
            >
              Repetir contraseña
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                strokeWidth={1.6}
                aria-hidden="true"
              />
              <Input
                id="repeatPassword"
                type={showRepeat ? "text" : "password"}
                className="pl-10 pr-10"
                autoComplete="new-password"
                value={repeatPassword}
                onChange={(event) => {
                  setPasswordError("");
                  setPasswordSuccess("");
                  setRepeatPassword(event.target.value);
                }}
              />
              <button
                type="button"
                onClick={() => setShowRepeat((value) => !value)}
                aria-label={
                  showRepeat ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 transition-colors hover:text-stone-600"
              >
                {showRepeat ? (
                  <EyeOff className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {passwordError ? <ErrorNote>{passwordError}</ErrorNote> : null}
          {passwordSuccess ? <SuccessNote>{passwordSuccess}</SuccessNote> : null}

          <Button
            type="submit"
            disabled={savingPassword || !newPassword || !repeatPassword}
            className="w-full rounded-xl"
          >
            {savingPassword ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : null}
            {savingPassword ? "Actualizando…" : "Cambiar contraseña"}
          </Button>
        </div>
      </form>

      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white py-3 text-sm text-stone-600 transition-colors hover:bg-stone-50 disabled:opacity-60"
      >
        {signingOut ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : null}
        Cerrar sesión
      </button>
    </div>
  );
}
