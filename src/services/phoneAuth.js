import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../firebase";

let recaptchaVerifier = null;

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

export async function sendPhonePin(phone, containerId) {
  const phoneNumber = normalizePhoneToE164(phone);

  if (!phoneNumber || phoneNumber.length < 12) {
    throw new Error("Informe um telefone valido com DDD.");
  }

  const verifier = getRecaptchaVerifier(containerId);
  const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);

  return { confirmationResult, phoneNumber };
}

export async function confirmPhonePin(confirmationResult, code) {
  if (!confirmationResult) {
    throw new Error("Solicite um PIN antes de confirmar.");
  }

  const result = await confirmationResult.confirm(code);
  return result.user;
}

export function getAllowedAdminPhones() {
  return String(import.meta.env.VITE_ADMIN_PHONE_NUMBERS || "")
    .split(",")
    .map((phone) => normalizePhoneToE164(phone.trim()))
    .filter(Boolean);
}

export function isAllowedAdminPhone(phoneNumber) {
  const allowedPhones = getAllowedAdminPhones();
  return allowedPhones.includes(normalizePhoneToE164(phoneNumber));
}
