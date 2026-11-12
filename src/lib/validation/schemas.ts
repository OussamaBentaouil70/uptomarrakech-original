import { z } from "zod";
import { CATEGORY_TYPES } from "@/lib/types";

export const categoryTypeSchema = z.enum(CATEGORY_TYPES);

export const categorySchema = z.object({
  slug: z.string().min(2),
  name: z.string().min(2),
  nameFr: z.string().optional().or(z.literal("")),
  type: categoryTypeSchema,
  heroImage: z.string().url().optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0),
  published: z.boolean(),
});

export const reviewSchema = z.object({
  name: z.string().min(2),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(2),
  commentFr: z.string().optional().or(z.literal("")),
  date: z.string(),
});

export const itemSchema = z.object({
  categoryType: categoryTypeSchema,
  slug: z.string().min(2),
  title: z.string().min(2),
  titleFr: z.string().optional().or(z.literal("")),
  excerpt: z.string().min(10),
  excerptFr: z.string().optional().or(z.literal("")),
  description: z.string().min(10),
  descriptionFr: z.string().optional().or(z.literal("")),
  coverImage: z.string().url(),
  gallery: z.array(z.string().url()).default([]),
  location: z.string().optional().or(z.literal("")),
  locationFr: z.string().optional().or(z.literal("")),
  locationUrl: z.string().url().optional().or(z.literal("")),
  price: z.coerce.number().min(0),
  priceUnit: z.enum(["night", "day", "person", "package"]),
  carte: z.string().url().optional().or(z.literal("")),
  reviews: z.array(reviewSchema).optional().default([]),
  accommodation: z
    .object({
      rooms: z.coerce.number().int().min(1),
      people: z.coerce.number().int().min(1),
    })
    .optional(),
  published: z.boolean(),
});

export const inquirySchema = z.object({
  itemId: z.string().min(1),
  itemSlug: z.string().min(1),
  categoryType: categoryTypeSchema,
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email(),
  date: z.string().min(1),
  time: z.string().min(1),
  persons: z.number().int().min(1).optional(),
  message: z.string().min(10),
  // Backward compatibility for existing data shape in admin views.
  name: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const hotAirBalloonFlightTypes = ["balloon", "private", "royal"] as const;

export const hotAirBalloonInquirySchema = z.object({
  itemId: z.string().min(1),
  itemSlug: z.string().min(1),
  categoryType: categoryTypeSchema,
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  date: z.string().min(1),
  flightType: z.enum(hotAirBalloonFlightTypes),
  passengers: z.number().int().min(1).max(10),
  stayLocation: z.string().optional().or(z.literal("")),
  message: z.string().optional().or(z.literal("")),
});

export type HotAirBalloonInquiryInput = z.infer<typeof hotAirBalloonInquirySchema>;

export type CategoryInput = z.infer<typeof categorySchema>;
export type ItemInput = z.infer<typeof itemSchema>;
export const blogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  titleFr: z.string().optional().or(z.literal("")),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().min(1, "Content is required"),
  contentFr: z.string().optional().or(z.literal("")),
  excerpt: z.string().min(1, "Excerpt is required"),
  excerptFr: z.string().optional().or(z.literal("")),
  coverImage: z.string().min(1, "Cover image is required"),
  gallery: z.array(z.string()).default([]),
  date: z.string().min(1, "Date is required"),
  published: z.boolean().default(true),
});

export type BlogInput = z.infer<typeof blogSchema>;
export type InquiryInput = z.infer<typeof inquirySchema>;

