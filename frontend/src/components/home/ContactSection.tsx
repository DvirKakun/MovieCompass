import ContactHeader from "../contact/ContactHeader";
import ContactCTA from "../contact/ContactCTA";

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="py-24 bg-background relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        {/* Section Header */}
        <ContactHeader />

        {/* Main Contact CTA */}
        <ContactCTA
          title="Ready to Connect?"
          description="Send us a message and we'll get back to you as soon as possible. We value every piece of feedback from our community."
        />
      </div>
    </section>
  );
}
