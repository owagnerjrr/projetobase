import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../firebase";

let recaptchaVerifier = null;
const DEFAULT_ADMIN_PHONE_NUMBERS = ["+5535998598071"];
const PIN_COOLDOWN_MS = 60 * 1000;

export function normalizePhoneToE164(value) {
  const digits = String(value || "").replace(/\D/g, "");

  if (!digits) return "";
  if (digits.startsWith("55")) return `+${digits}`;
  if (digits.length === 10 || digits.length === 11) return `+55${digits}`;

  return `+${digits}`;
}

function getRecaptchaVerifier(containerId) {
  if (recaptchaVerifier) return recaptchaVerifier;

  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
  });

  return recaptchaVerifier;
}

function getCooldownKey(phoneNumber) {
  return `phone-pin-cooldown:${phoneNumber}`;
}

function getPinCooldownRemaining(phoneNumber) {
  const cooldownUntil = Number(window.localStorage.getItem(getCooldownKey(phoneNumber)) || 0);
  return Math.max(0, cooldownUntil - Date.now());
}

function setPinCooldown(phoneNumber) {
  window.localStorage.setItem(getCooldownKey(phoneNumber), String(Date.now() + PIN_COOLDOWN_MS));
}

export function getFriendlyPhoneAuthError(error) {
  if (error?.code === "auth/too-many-requests") {
    return "Muitas tentativas em pouco tempo. Aguarde alguns minutos antes de pedir um novo PIN.";
  }

  if (error?.code === "auth/invalid-phone-number") {
    return "Informe um telefone valido com DDD.";
  }

  if (error?.code === "auth/billing-not-enabled") {
    return "O envio de SMS precisa do plano Blaze ativo no Firebase.";
  }

  return error?.message || "Erro ao enviar PIN";
}

export async function sendPhonePin(phone, containerId) {
  const phoneNumber = normalizePhoneToE164(phone);

  if (!phoneNumber || phoneNumber.length < 12) {
    throw new Error("Informe um telefone valido com DDD.");
  }

  const cooldownRemaining = getPinCooldownRemaining(phoneNumber);
  if (cooldownRemaining > 0) {
    const seconds = Math.ceil(cooldownRemaining / 1000);
    throw new Error(`Aguarde ${seconds}s para solicitar outro PIN.`);
  }

  setPinCooldown(phoneNumber);

  const verifier = getRecaptchaVerifier(containerId);
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);

    return { confirmationResult, phoneNumber };
  } catch (error) {
    throw new Error(getFriendlyPhoneAuthError(error), { cause: error });
  }
}

export async function confirmPhonePin(confirmationResult, code) {
  if (!confirmationResult) {
    throw new Error("Solicite um PIN antes de confirmar.");
  }

  const result = await confirmationResult.confirm(code);
  return result.user;
}

export function getAllowedAdminPhones() {
  const configuredPhones = String(import.meta.env.VITE_ADMIN_PHONE_NUMBERS || "")
    .split(",")
    .map((phone) => normalizePhoneToE164(phone.trim()))
    .filter(Boolean);

  return [...new Set([...configuredPhones, ...DEFAULT_ADMIN_PHONE_NUMBERS])];
}

export function isAllowedAdminPhone(phoneNumber) {
  const allowedPhones = getAllowedAdminPhones();
  return allowedPhones.includes(normalizePhoneToE164(phoneNumber));
}
