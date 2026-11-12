export type MailFormPayload = {
  formType: "reservation" | "contact";
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  service_type: string;
  preferred_date?: string;
  preferred_time?: string;
  number_of_persons?: number;
  item_slug?: string;
  category_type?: string;
  flight_type?: string;
  stay_location?: string;
  message: string;
};

type MailerResponse = {
  success: boolean;
  message?: string;
};

export async function sendFormEmail(payload: MailFormPayload): Promise<void> {
  const endpoint = process.env.NEXT_PUBLIC_PHP_MAILER_ENDPOINT?.trim() || "/api/send-email";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = (await response.json().catch(() => ({ success: false, message: "Invalid response from mail service." }))) as MailerResponse;

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Email sending failed.");
  }
}
