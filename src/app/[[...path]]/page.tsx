import type { Metadata } from "next";
import { allStaticParams, metadataFor, renderRoute } from "@/lib/render";

// Every URL comes from data/content/routes.json (same URLs as the old WordPress site).
export const dynamicParams = false;

type Props = { params: Promise<{ path?: string[] }> };

export function generateStaticParams() {
  return allStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params;
  return metadataFor(path);
}

export default async function Page({ params }: Props) {
  const { path } = await params;
  return renderRoute(path);
}
