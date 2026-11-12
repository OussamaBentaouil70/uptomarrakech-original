"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { sendFormEmail } from "@/lib/forms/mailer";
import { thankYouPath } from "@/lib/locale";
import type { Lang } from "@/lib/types";

const contactSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  message: z.string().min(10),
});

type ContactFormInput = z.infer<typeof contactSchema>;

export function ContactForm({ lang, serviceType = "General Contact" }: { lang: Lang; serviceType?: string }) {
  const router = useRouter();
  const fr = lang === "fr";
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<ContactFormInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { fullName: "", email: "", phone: "", message: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setSubmitting(true);
      await sendFormEmail({
        formType: "contact",
        contact_name: values.fullName,
        contact_email: values.email,
        contact_phone: values.phone,
        service_type: serviceType,
        message: values.message,
      });
      toast.success(fr ? "Votre message a bien été envoyé." : "Your message was sent successfully.");
      form.reset();
      router.push(thankYouPath(lang, "contact"));
    } catch (error) {
      console.error(error);
      toast.error(fr ? "Nous n'avons pas pu envoyer votre message. Veuillez réessayer." : "We could not send your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  });

  const errors = form.formState.errors;
  const errorText: Record<keyof ContactFormInput, string> = fr
    ? {
        fullName: "Veuillez saisir votre nom complet",
        email: "Veuillez saisir une adresse email valide",
        phone: "Veuillez saisir un numéro de téléphone valide",
        message: "Veuillez saisir au moins 10 caractères",
      }
    : {
        fullName: "Please enter your full name",
        email: "Please enter a valid email",
        phone: "Please enter a valid phone number",
        message: "Please enter at least 10 characters",
      };
  const input = "w-full rounded-xl border border-border bg-white/90 p-3";

  return (
    <form onSubmit={onSubmit} className="ui-surface space-y-3 p-5 sm:p-6" noValidate>
      <p className="ui-eyebrow mb-2">{fr ? "Envoyer un message" : "Send a message"}</p>
      <input className={input} placeholder={fr ? "Nom complet" : "Full name"} autoComplete="name" {...form.register("fullName")} />
      {errors.fullName && <p className="text-xs text-red-600">{errorText.fullName}</p>}
      <input className={input} placeholder="Email" type="email" autoComplete="email" {...form.register("email")} />
      {errors.email && <p className="text-xs text-red-600">{errorText.email}</p>}
      <input className={input} placeholder={fr ? "Téléphone" : "Phone"} type="tel" autoComplete="tel" {...form.register("phone")} />
      {errors.phone && <p className="text-xs text-red-600">{errorText.phone}</p>}
      <textarea className={`${input} min-h-32`} placeholder="Message" {...form.register("message")} />
      {errors.message && <p className="text-xs text-red-600">{errorText.message}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-primary px-6 py-3 text-primary-foreground transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? (fr ? "Envoi..." : "Sending...") : fr ? "Envoyer" : "Send"}
      </button>
    </form>
  );
}
