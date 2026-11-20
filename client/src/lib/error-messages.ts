// Translate cryptic backend / Postgres error messages into plain English
// for the admin dashboard. Anything we don't recognize falls through to the
// original message so we never hide useful info.

const ENUM_FIELD_LABELS: Record<string, string> = {
  subtype: "Property subtype",
  transaction_type: "Transaction type",
  furnishing: "Handover condition",
  developer: "Developer",
  location: "Location",
  property_type: "Property type",
};

function prettifyEnumField(rawField: string): string {
  // Postgres enum names typically look like "subtype_enum" or "transaction_type"
  const key = rawField.replace(/_enum$/, "");
  return ENUM_FIELD_LABELS[key] ?? key.replace(/_/g, " ");
}

export function humanizeError(message: string): string {
  if (!message) return "Something went wrong. Please try again.";

  // The server's own refusal of a listing (server/listing-gate.ts) already says
  // exactly what to fix. Show it as is: it can contain numbers such as 1,401
  // that the generic 401/429 checks below would misread.
  if (message.startsWith("Listing not saved.")) {
    return message.replace(/\s*\|\s*/g, "\n");
  }

  // "invalid input value for enum subtype_enum: \"Business Park \""
  const enumMatch = message.match(/invalid input value for enum (\w+):\s*"([^"]*)"/i);
  if (enumMatch) {
    const field = prettifyEnumField(enumMatch[1]);
    const value = enumMatch[2];
    return `${field} doesn't accept the value "${value}". Pick one of the options in the dropdown.`;
  }

  // "duplicate key value violates unique constraint \"...\""
  if (/duplicate key value violates unique constraint/i.test(message)) {
    return "This listing conflicts with an existing one (a unique field is already in use).";
  }

  // "null value in column \"title\" of relation \"listings\" violates not-null constraint"
  const notNullMatch = message.match(/null value in column "(\w+)".+not-null constraint/i);
  if (notNullMatch) {
    return `"${notNullMatch[1]}" is required and cannot be empty.`;
  }

  // Zod validation errors from server-side schema
  if (/invalid listing payload/i.test(message)) {
    return "Some fields have invalid values. Check that all required fields are filled in and numbers are valid.";
  }

  // Rate-limit
  if (/too many requests/i.test(message) || message.includes("429")) {
    return "Too many requests. Wait a moment and try again.";
  }

  // Auth
  if (message.includes("401") || /unauthori[sz]ed/i.test(message)) {
    return "Your session expired. Log out and log back in.";
  }

  // Supabase not configured (shouldn't happen in prod, but just in case)
  if (/supabase not configured/i.test(message)) {
    return "Server is misconfigured. Contact the developer.";
  }

  // Network / fetch failures
  if (/failed to fetch|networkerror/i.test(message)) {
    return "Couldn't reach the server. Check your internet connection.";
  }

  return message;
}
