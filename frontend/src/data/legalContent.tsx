import { FileText, Shield } from "lucide-react";
import { ReactElement } from "react";

export interface LegalSection {
  section: string;
  content: string;
}

export interface LegalDocument {
  title: string;
  icon: ReactElement;
  lastUpdated: string;
  content: LegalSection[];
}

export interface LegalContent {
  terms: LegalDocument;
  privacy: LegalDocument;
}

export type LegalDocumentType = "terms" | "privacy";

export const legalContent: LegalContent = {
  terms: {
    title: "Terms of Service",
    icon: <FileText className="w-5 h-5" />,
    lastUpdated: "December 15, 2024",
    content: [
      {
        section: "1. Acceptance of Terms",
        content:
          "By accessing and using MovieVault, you accept and agree to be bound by the terms and provision of this agreement. MovieVault is a movie discovery and recommendation platform that uses The Movie Database (TMDB) API to provide comprehensive movie information.",
      },
      {
        section: "2. Use License",
        content:
          "Permission is granted to temporarily use MovieVault for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials, use the materials for any commercial purpose or for any public display, attempt to reverse engineer any software contained on the website, or remove any copyright or other proprietary notations from the materials.",
      },
      {
        section: "3. User Accounts",
        content:
          "When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for keeping your account information up to date. You agree not to disclose your password to any third party and to take sole responsibility for activities that occur under your account.",
      },
      {
        section: "4. AI Recommendations",
        content:
          "MovieVault uses artificial intelligence to provide personalized movie recommendations. These recommendations are generated based on your viewing history, ratings, and preferences. While we strive for accuracy, recommendations are suggestions only and we do not guarantee their suitability for your specific needs.",
      },
      {
        section: "5. Content and Data",
        content:
          "All movie data, images, and information are provided through The Movie Database (TMDB) API. We do not own this content and cannot guarantee its accuracy or availability. Movie availability for streaming or purchase is provided for informational purposes only.",
      },
      {
        section: "6. Prohibited Uses",
        content:
          "You may not use MovieVault to: transmit or procure the sending of advertising or promotional material, impersonate or attempt to impersonate the company or employees, engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the website, or use the website in any manner that could disable, overburden, damage, or impair the site.",
      },
      {
        section: "7. Limitation of Liability",
        content:
          "In no event shall MovieVault or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use MovieVault, even if we have been notified orally or in writing of the possibility of such damage.",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    icon: <Shield className="w-5 h-5" />,
    lastUpdated: "December 15, 2024",
    content: [
      {
        section: "1. Information We Collect",
        content:
          "We collect information you provide directly to us, such as when you create an account, rate movies, or contact us. This includes your name, email address, profile information, movie ratings, watchlist, and favorites. We also collect usage information about how you interact with our services.",
      },
      {
        section: "2. How We Use Your Information",
        content:
          "We use the information we collect to: provide, maintain, and improve our services; generate personalized movie recommendations using AI; send you technical notices and support messages; process transactions and send related information; respond to your comments and questions; and communicate with you about products, services, and events.",
      },
      {
        section: "3. Information Sharing",
        content:
          "We do not sell, trade, or otherwise transfer your personal information to outside parties except as described in this policy. We may share your information with: service providers who assist us in operating our website and conducting our business; when required by law or to protect our rights; and with your consent for any other purpose.",
      },
      {
        section: "4. Data Security",
        content:
          "We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes internal reviews of our data collection, storage, and processing practices and security measures, including appropriate encryption and physical security measures.",
      },
      {
        section: "5. Third-Party Services",
        content:
          "MovieVault integrates with The Movie Database (TMDB) API to provide movie information. We also offer Google OAuth authentication. These services have their own privacy policies, and we encourage you to review them. We are not responsible for the privacy practices of these third-party services.",
      },
      {
        section: "6. AI and Machine Learning",
        content:
          "We use AI and machine learning algorithms to analyze your movie preferences and provide personalized recommendations. This processing is done locally on our servers and your data is not shared with external AI services. You can opt out of AI recommendations in your account settings.",
      },
      {
        section: "7. Data Retention",
        content:
          "We retain your personal information for as long as your account is active or as needed to provide you services. You may delete your account at any time, and we will delete your personal information within 30 days, except where retention is required by law.",
      },
      {
        section: "8. Your Rights",
        content:
          "You have the right to access, update, or delete your personal information. You can also request a copy of your data or restrict its processing. To exercise these rights, please contact us through the settings in your account or by email.",
      },
    ],
  },
};
