import { BackNav } from "@/components/back-nav/BackNav";

export default function PagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <BackNav />
      {children}
    </>
  );
}
