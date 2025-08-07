import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Legal Documents - Mystic Arcana",
  description:
    "Privacy policy, terms of service, and other legal documents for Mystic Arcana",
};
export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="legal-layout">{children}</div>;
}
