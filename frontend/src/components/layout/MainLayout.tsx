import { Navbar } from "../navigation/Navbar";
// import { Footer } from "../layout/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background text-foreground font-sans">
      <Navbar />
      <main className="pt-20">{children}</main>
    </div>
  );
}
