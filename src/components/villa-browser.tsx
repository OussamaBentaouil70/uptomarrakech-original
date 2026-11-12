"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BedDouble, MapPin, RotateCcw, Users } from "lucide-react";
import type { Lang } from "@/lib/types";

export type VillaCardData = {
  id: number;
  path: string;
  title: string;
  excerpt: string;
  image: string | null;
  location: string | null;
  rooms: number | null;
  people: number | null;
  priceFrom: number | null;
};

type Range = [number, number];

/** Two-thumb range slider (two native range inputs on one track). */
function RangeFilter({ min, max, value, onChange, label }: { min: number; max: number; value: Range; onChange: (v: Range) => void; label: (n: number) => string }) {
  const pct = (n: number) => (max === min ? 0 : ((n - min) / (max - min)) * 100);
  const thumb =
    "pointer-events-none absolute inset-x-0 top-1/2 h-0 w-full -translate-y-1/2 appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-white";
  return (
    <div className="space-y-3">
      <div className="relative h-6">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-border" />
        <div className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary" style={{ left: `${pct(value[0])}%`, right: `${100 - pct(value[1])}%` }} />
        <input
          type="range"
          min={min}
          max={max}
          value={value[0]}
          aria-label={`${label(value[0])} (min)`}
          onChange={(e) => onChange([Math.min(Number(e.target.value), value[1]), value[1]])}
          className={thumb}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value[1]}
          aria-label={`${label(value[1])} (max)`}
          onChange={(e) => onChange([value[0], Math.max(Number(e.target.value), value[0])])}
          className={thumb}
        />
      </div>
      <p className="text-sm text-zinc-600">
        {label(value[0])} — {label(value[1])}
      </p>
    </div>
  );
}

function VillaCard({ villa, lang }: { villa: VillaCardData; lang: Lang }) {
  const fr = lang === "fr";
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border/40 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
      <Link href={villa.path} className="relative block h-64 overflow-hidden bg-secondary/30">
        {villa.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={villa.image} alt={villa.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" />
        )}
        {villa.location && (
          <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
            <MapPin className="h-3.5 w-3.5" /> {villa.location}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="ui-heading text-2xl font-semibold leading-tight">
          <Link href={villa.path} className="hover:text-primary">{villa.title}</Link>
        </h3>
        {(villa.rooms || villa.people) && (
          <div className="mt-3 flex items-center gap-4 text-sm text-zinc-700">
            {villa.rooms != null && (
              <span className="flex items-center gap-1.5">
                <BedDouble className="h-4 w-4 text-primary" /> {villa.rooms} {fr ? "Chambres" : "Bedrooms"}
              </span>
            )}
            {villa.rooms != null && villa.people != null && <span className="h-4 w-px bg-border" />}
            {villa.people != null && (
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" /> {villa.people} {fr ? "Personnes" : "Guests"}
              </span>
            )}
          </div>
        )}
        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{villa.excerpt}</p>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/60 pt-5">
          <p className="text-sm text-zinc-700">
            {villa.priceFrom ? (
              <>
                {fr ? "À partir de " : "From "}
                <span className="ui-heading text-xl font-semibold text-foreground">{villa.priceFrom.toLocaleString(fr ? "fr-FR" : "en-GB")}€</span> / {fr ? "nuit" : "night"}
              </>
            ) : fr ? (
              "Prix sur demande"
            ) : (
              "Price on request"
            )}
          </p>
          <Link
            href={villa.path}
            className="shrink-0 rounded-full bg-primary px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest text-primary-foreground transition-all hover:brightness-110"
          >
            {fr ? "Plus de détails" : "More details"}
          </Link>
        </div>
      </div>
    </article>
  );
}

export function VillaBrowser({ villas, lang }: { villas: VillaCardData[]; lang: Lang }) {
  const fr = lang === "fr";
  const bounds = useMemo(() => {
    const rooms = villas.map((v) => v.rooms).filter((n): n is number => n != null);
    const people = villas.map((v) => v.people).filter((n): n is number => n != null);
    return {
      rooms: [Math.min(...rooms), Math.max(...rooms)] as Range,
      people: [Math.min(...people), Math.max(...people)] as Range,
      locations: [...new Set(villas.map((v) => v.location).filter((l): l is string => Boolean(l)))].sort((a, b) => a.localeCompare(b, lang)),
    };
  }, [villas, lang]);

  const [location, setLocation] = useState("");
  const [rooms, setRooms] = useState<Range>(bounds.rooms);
  const [people, setPeople] = useState<Range>(bounds.people);

  const filtered = villas.filter(
    (v) =>
      (!location || v.location === location) &&
      (v.rooms == null || (v.rooms >= rooms[0] && v.rooms <= rooms[1])) &&
      (v.people == null || (v.people >= people[0] && v.people <= people[1])),
  );
  const isFiltered = location !== "" || rooms[0] !== bounds.rooms[0] || rooms[1] !== bounds.rooms[1] || people[0] !== bounds.people[0] || people[1] !== bounds.people[1];

  return (
    <div className="space-y-10">
      <div className="ui-surface grid gap-6 p-6 md:grid-cols-3 md:items-start">
        <label className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">{fr ? "Localisation" : "Location"}</span>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-zinc-800 outline-none focus:border-primary"
          >
            <option value="">{fr ? "Toutes les localisations" : "All locations"}</option>
            {bounds.locations.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">{fr ? "Chambres" : "Bedrooms"}</span>
          <RangeFilter min={bounds.rooms[0]} max={bounds.rooms[1]} value={rooms} onChange={setRooms} label={(n) => `${n} ${fr ? "Chambres" : "Bedrooms"}`} />
        </div>
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">{fr ? "Personnes" : "Guests"}</span>
          <RangeFilter min={bounds.people[0]} max={bounds.people[1]} value={people} onChange={setPeople} label={(n) => `${n} ${fr ? "Personnes" : "Guests"}`} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-600">
          {filtered.length} {fr ? (filtered.length > 1 ? "villas" : "villa") : filtered.length === 1 ? "villa" : "villas"}
        </p>
        {isFiltered && (
          <button
            type="button"
            onClick={() => {
              setLocation("");
              setRooms(bounds.rooms);
              setPeople(bounds.people);
            }}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary hover:underline"
          >
            <RotateCcw className="h-3.5 w-3.5" /> {fr ? "Réinitialiser" : "Reset"}
          </button>
        )}
      </div>

      {filtered.length ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => (
            <VillaCard key={v.id} villa={v} lang={lang} />
          ))}
        </div>
      ) : (
        <p className="ui-surface p-12 text-center font-serif text-xl italic text-muted-foreground">
          {fr ? "Aucune villa ne correspond à ces critères." : "No villa matches these filters."}
        </p>
      )}
    </div>
  );
}
