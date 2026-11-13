"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { inquirySchema, type InquiryInput } from "@/lib/validation/schemas";
import { toast } from "sonner";
import type { CategoryType } from "@/lib/types";
import { isTurnstileError, sendFormEmail } from "@/lib/forms/mailer";
import { TURNSTILE_SITE_KEY, TURNSTILE_TEXT, TurnstileWidget, type TurnstileHandle } from "@/components/turnstile-widget";
import { getLocaleFromPathname, thankYouPath } from "@/lib/locale";

type Props = {
  itemId: string;
  itemSlug: string;
  categoryType: CategoryType;
};

export function InquiryForm({ itemId, itemSlug, categoryType }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileHandle>(null);
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const isFr = locale === "fr";
  const form = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      itemId,
      itemSlug,
      categoryType,
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      date: "",
      time: "",
      persons: undefined,
      message: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      toast.error(TURNSTILE_TEXT[locale].required);
      return;
    }
    try {
      setSubmitting(true);
      await sendFormEmail({
        turnstileToken,
        formType: "reservation",
        contact_name: `${values.firstName} ${values.lastName}`.trim(),
        contact_email: values.email,
        contact_phone: values.phone,
        service_type: values.categoryType,
        preferred_date: values.date,
        preferred_time: values.time,
        number_of_persons: values.persons,
        item_slug: values.itemSlug,
        category_type: values.categoryType,
        message: values.message,
      });
      toast.success(isFr ? "Demande de reservation envoyee." : "Reservation request sent.");
      form.reset({
        itemId,
        itemSlug,
        categoryType,
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        date: "",
        time: "",
        persons: undefined,
        message: "",
      });
      router.push(thankYouPath(locale, "reservation"));
    } catch (error) {
      console.error(error);
      toast.error(isTurnstileError(error) ? TURNSTILE_TEXT[locale].failed : isFr ? "La demande n'a pas pu etre envoyee. Veuillez reessayer." : "Failed to send request. Please try again.");
    } finally {
      setSubmitting(false);
      turnstileRef.current?.reset();
    }
  });

  const errors = form.formState.errors;
  const errorText: Partial<Record<keyof InquiryInput, string>> = isFr
    ? {
        firstName: "Veuillez saisir votre prenom",
        lastName: "Veuillez saisir votre nom",
        phone: "Veuillez saisir un numero de telephone valide",
        email: "Veuillez saisir une adresse email valide",
        date: "Veuillez choisir une date",
        time: "Veuillez choisir une heure",
        persons: "Veuillez saisir au moins 1 personne",
        message: "Veuillez saisir au moins 10 caracteres",
      }
    : {};

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-1">
        <h3 className="ui-heading text-2xl font-semibold tracking-tight">{isFr ? "Demande de reservation" : "Reservation request"}</h3>
        <p className="text-sm text-muted-foreground">
          {isFr
            ? "Remplissez vos informations et notre equipe conciergerie vous contactera rapidement."
            : "Fill in your details and our concierge team will contact you quickly."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="inquiry-first-name" className="text-xs font-bold uppercase tracking-wider text-foreground/80">
            {isFr ? "Prenom" : "First name"}
          </Label>
          <Input
            id="inquiry-first-name"
            className="h-11 border-border/60 bg-background px-4"
            placeholder={isFr ? "Prenom" : "First name"}
            {...form.register("firstName")}
          />
          {errors.firstName && <p className="text-xs text-red-600">{errorText.firstName || errors.firstName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="inquiry-last-name" className="text-xs font-bold uppercase tracking-wider text-foreground/80">
            {isFr ? "Nom" : "Last name"}
          </Label>
          <Input
            id="inquiry-last-name"
            className="h-11 border-border/60 bg-background px-4"
            placeholder={isFr ? "Nom" : "Last name"}
            {...form.register("lastName")}
          />
          {errors.lastName && <p className="text-xs text-red-600">{errorText.lastName || errors.lastName.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="inquiry-phone" className="text-xs font-bold uppercase tracking-wider text-foreground/80">
          {isFr ? "Telephone" : "Phone"}
        </Label>
        <Input
          id="inquiry-phone"
          className="h-11 border-border/60 bg-background px-4"
          placeholder="+212 ..."
          {...form.register("phone")}
        />
        {errors.phone && <p className="text-xs text-red-600">{errorText.phone || errors.phone.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="inquiry-email" className="text-xs font-bold uppercase tracking-wider text-foreground/80">
          Email
        </Label>
        <Input
          id="inquiry-email"
          className="h-11 border-border/60 bg-background px-4"
          placeholder="you@example.com"
          type="email"
          {...form.register("email")}
        />
        {errors.email && <p className="text-xs text-red-600">{errorText.email || errors.email.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="inquiry-date" className="text-xs font-bold uppercase tracking-wider text-foreground/80">
            {isFr ? "Date" : "Date"}
          </Label>
          <Input
            id="inquiry-date"
            className="h-11 border-border/60 bg-background px-4"
            type="date"
            {...form.register("date")}
          />
          {errors.date && <p className="text-xs text-red-600">{errorText.date || errors.date.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="inquiry-time" className="text-xs font-bold uppercase tracking-wider text-foreground/80">
            {isFr ? "Heure" : "Time"}
          </Label>
          <Input
            id="inquiry-time"
            className="h-11 border-border/60 bg-background px-4"
            type="time"
            {...form.register("time")}
          />
          {errors.time && <p className="text-xs text-red-600">{errorText.time || errors.time.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="inquiry-persons" className="text-xs font-bold uppercase tracking-wider text-foreground/80">
          {isFr ? "Nombre de personnes" : "Number of persons"}
        </Label>
        <Input
          id="inquiry-persons"
          className="h-11 border-border/60 bg-background px-4"
          type="number"
          min="1"
          placeholder="1"
          {...form.register("persons", { valueAsNumber: true })}
        />
        {errors.persons && <p className="text-xs text-red-600">{errorText.persons || errors.persons.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="inquiry-message" className="text-xs font-bold uppercase tracking-wider text-foreground/80">
          {isFr ? "Message" : "Message"}
        </Label>
        <Textarea
          id="inquiry-message"
          className="min-h-32 border-border/60 bg-background px-4 py-3"
          rows={6}
          placeholder={
            isFr
              ? "Dites-nous ce dont vous avez besoin : nombre d'invites, demandes speciales, horaire prefere..."
              : "Tell us what you need: number of guests, special requests, preferred time..."
          }
          {...form.register("message")}
        />
        {errors.message && <p className="text-xs text-red-600">{errorText.message || errors.message.message}</p>}
      </div>

      <TurnstileWidget ref={turnstileRef} lang={locale} onToken={setTurnstileToken} action="reservation" />
      <Button
        type="submit"
        disabled={submitting}
        aria-busy={submitting}
        className={`h-12 w-full bg-primary text-base font-semibold text-primary-foreground hover:brightness-110 ${
          submitting ? 'cursor-wait opacity-80' : 'cursor-pointer'
        }`}
      >
        {submitting ? (
          <span className="inline-flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            {isFr ? "Envoi..." : "Sending..."}
          </span>
        ) : (
          isFr ? 'Envoyer la reservation' : 'Send reservation'
        )}
      </Button>
    </form>
  );
}

