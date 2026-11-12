"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { hotAirBalloonInquirySchema, type HotAirBalloonInquiryInput } from "@/lib/validation/schemas";
import { toast } from "sonner";
import type { CategoryType } from "@/lib/types";
import { sendFormEmail } from "@/lib/forms/mailer";
import { getLocaleFromPathname, thankYouPath } from "@/lib/locale";

type Props = {
  itemId: string;
  itemSlug: string;
  categoryType: CategoryType;
};

const FLIGHT_TYPE_OPTIONS = [
  {
    value: "balloon" as const,
    en: "Hot Air Balloon Flight (140 €)",
    fr: "Vol en Montgolfière (140 €)",
  },
  {
    value: "private" as const,
    en: "Private flight, marriage proposal, VIP (price on request)",
    fr: "Vol privé, demande en mariage, VIP (prix sur demande)",
  },
  {
    value: "royal" as const,
    en: "Royal Flight (510 €)",
    fr: "Vol Royal (510 €)",
  },
];

const PASSENGER_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1);

const defaultFormValues: HotAirBalloonInquiryInput = {
  itemId: "",
  itemSlug: "",
  categoryType: "activity",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  date: "",
  flightType: "balloon",
  passengers: 1,
  stayLocation: "",
  message: "",
};

export function HotAirBalloonForm({ itemId, itemSlug, categoryType }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const isFr = locale === "fr";
  const form = useForm<HotAirBalloonInquiryInput>({
    resolver: zodResolver(hotAirBalloonInquirySchema),
    defaultValues: { ...defaultFormValues, itemId, itemSlug, categoryType },
  });

  const flightTypeLabel = (value: string) => {
    const option = FLIGHT_TYPE_OPTIONS.find((item) => item.value === value);
    if (!option) return value;
    return isFr ? option.fr : option.en;
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setSubmitting(true);

      const flightDetails = isFr
        ? `Type de vol : ${flightTypeLabel(values.flightType)}\nPassager(s) : ${values.passengers}\nLieu de sejour : ${values.stayLocation || "-"}`
        : `Flight type: ${flightTypeLabel(values.flightType)}\nPassenger(s): ${values.passengers}\nStay location: ${values.stayLocation || "-"}`;
      const fullMessage = values.message ? `${values.message}\n\n${flightDetails}` : flightDetails;

      await sendFormEmail({
        formType: "reservation",
        contact_name: `${values.firstName} ${values.lastName}`.trim(),
        contact_email: values.email,
        contact_phone: values.phone,
        service_type: isFr ? "Vol en montgolfiere" : "Hot air balloon flight",
        preferred_date: values.date,
        number_of_persons: values.passengers,
        item_slug: values.itemSlug,
        category_type: values.categoryType,
        flight_type: flightTypeLabel(values.flightType),
        stay_location: values.stayLocation,
        message: fullMessage,
      });

      toast.success(isFr ? "Demande de reservation envoyee." : "Reservation request sent.");
      form.reset({ ...defaultFormValues, itemId, itemSlug, categoryType });
      router.push(thankYouPath(locale, "reservation"));
    } catch (error) {
      console.error(error);
      toast.error(isFr ? "La demande n'a pas pu etre envoyee. Veuillez reessayer." : "Failed to send request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  });

  const errors = form.formState.errors;
  const errorText: Partial<Record<keyof HotAirBalloonInquiryInput, string>> = isFr
    ? {
        firstName: "Veuillez saisir votre prenom",
        lastName: "Veuillez saisir votre nom",
        email: "Veuillez saisir une adresse email valide",
        phone: "Veuillez saisir un numero de telephone valide",
        date: "Veuillez choisir une date",
        flightType: "Veuillez choisir un type de vol",
        passengers: "Veuillez choisir le nombre de passagers",
      }
    : {};

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-1">
        <h3 className="ui-heading text-2xl font-semibold tracking-tight">
          {isFr ? "Reservation vol en montgolfiere" : "Hot Air Balloon Reservation"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isFr
            ? "Remplissez vos informations et notre equipe conciergerie vous contactera rapidement."
            : "Fill in your details and our concierge team will contact you quickly."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="balloon-first-name" className="text-xs font-bold uppercase tracking-wider text-foreground/80">
            {isFr ? "Prenom *" : "First name *"}
          </Label>
          <Input
            id="balloon-first-name"
            className="h-11 border-border/60 bg-background px-4"
            placeholder={isFr ? "Prenom" : "First name"}
            {...form.register("firstName")}
          />
          {errors.firstName && <p className="text-xs text-red-600">{errorText.firstName || errors.firstName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="balloon-last-name" className="text-xs font-bold uppercase tracking-wider text-foreground/80">
            {isFr ? "Nom *" : "Last name *"}
          </Label>
          <Input
            id="balloon-last-name"
            className="h-11 border-border/60 bg-background px-4"
            placeholder={isFr ? "Nom" : "Last name"}
            {...form.register("lastName")}
          />
          {errors.lastName && <p className="text-xs text-red-600">{errorText.lastName || errors.lastName.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="balloon-email" className="text-xs font-bold uppercase tracking-wider text-foreground/80">
          {isFr ? "E-mail *" : "Email *"}
        </Label>
        <Input
          id="balloon-email"
          className="h-11 border-border/60 bg-background px-4"
          placeholder="you@example.com"
          type="email"
          {...form.register("email")}
        />
        {errors.email && <p className="text-xs text-red-600">{errorText.email || errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="balloon-phone" className="text-xs font-bold uppercase tracking-wider text-foreground/80">
          {isFr ? "Numero de telephone *" : "Phone number *"}
        </Label>
        <Input
          id="balloon-phone"
          className="h-11 border-border/60 bg-background px-4"
          placeholder="+212 ..."
          {...form.register("phone")}
        />
        {errors.phone && <p className="text-xs text-red-600">{errorText.phone || errors.phone.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="balloon-date" className="text-xs font-bold uppercase tracking-wider text-foreground/80">
          {isFr ? "Date de vol souhaitee *" : "Preferred flight date *"}
        </Label>
        <Input
          id="balloon-date"
          className="h-11 border-border/60 bg-background px-4"
          type="date"
          {...form.register("date")}
        />
        {errors.date && <p className="text-xs text-red-600">{errorText.date || errors.date.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-foreground/80">
            {isFr ? "Type de vol *" : "Flight type *"}
          </Label>
          <Controller
            control={form.control}
            name="flightType"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-11 w-full rounded-lg border-border/60 bg-background px-4">
                  <SelectValue placeholder={isFr ? "Choisir un type de vol" : "Choose a flight type"}>
                    {(value: string | null) => (value ? flightTypeLabel(value) : (isFr ? "Choisir un type de vol" : "Choose a flight type"))}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {FLIGHT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="items-start">
                      <span className="whitespace-normal wrap-break-word leading-snug">
                        {isFr ? option.fr : option.en}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.flightType && <p className="text-xs text-red-600">{errorText.flightType || errors.flightType.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-foreground/80">
            {isFr ? "Passager(s) *" : "Passenger(s) *"}
          </Label>
          <Controller
            control={form.control}
            name="passengers"
            render={({ field }) => (
              <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                <SelectTrigger className="h-11 w-full rounded-lg border-border/60 bg-background px-4">
                  <SelectValue placeholder={isFr ? "Nombre de passagers" : "Number of passengers"}>
                    {(value: string | null) => {
                      const count = Number(value);
                      if (!value || !count) return isFr ? "Nombre de passagers" : "Number of passengers";
                      return `${count} ${count > 1 ? (isFr ? "personnes" : "persons") : (isFr ? "personne" : "person")}`;
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {PASSENGER_OPTIONS.map((count) => (
                    <SelectItem key={count} value={String(count)}>
                      {count} {count > 1 ? (isFr ? "personnes" : "persons") : (isFr ? "personne" : "person")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.passengers && <p className="text-xs text-red-600">{errorText.passengers || errors.passengers.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="balloon-stay-location" className="text-xs font-bold uppercase tracking-wider text-foreground/80">
          {isFr ? "Lieu de votre sejour a Marrakech" : "Where you're staying in Marrakech"}
        </Label>
        <Input
          id="balloon-stay-location"
          className="h-11 border-border/60 bg-background px-4"
          placeholder={isFr ? "Nom de votre hotel ou riad" : "Your hotel or riad name"}
          {...form.register("stayLocation")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="balloon-message" className="text-xs font-bold uppercase tracking-wider text-foreground/80">
          {isFr ? "Votre message (optionnel)" : "Your message (optional)"}
        </Label>
        <Textarea
          id="balloon-message"
          className="min-h-32 border-border/60 bg-background px-4 py-3"
          rows={6}
          placeholder={
            isFr
              ? "Demandes speciales, occasion particuliere, horaire prefere..."
              : "Special requests, special occasion, preferred time..."
          }
          {...form.register("message")}
        />
      </div>

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
