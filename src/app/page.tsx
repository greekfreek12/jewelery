import Link from "next/link";
import { MessageSquare, Star, Users, Phone, ArrowRight, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ContractorGrow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium">
              Sign In
            </Link>
            <Link href="/signup" className="btn-primary">
              Start Free Trial
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Turn Every Lead Into a{" "}
            <span className="text-primary-600">5-Star Review</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The all-in-one platform for contractors to manage leads, automate follow-ups,
            and collect Google reviews on autopilot.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/signup" className="btn-primary text-lg px-8 py-3">
              Start 14-Day Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <span className="text-gray-500">No credit card required</span>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-6xl mx-auto mt-24 grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Phone className="w-8 h-8 text-primary-600" />}
            title="Dedicated Business Line"
            description="Get your own phone number. Texts and calls route to your cell. Never miss a lead."
          />
          <FeatureCard
            icon={<MessageSquare className="w-8 h-8 text-primary-600" />}
            title="Unified Inbox"
            description="All conversations in one place. Reply to customers via SMS from your dashboard or phone."
          />
          <FeatureCard
            icon={<Star className="w-8 h-8 text-primary-600" />}
            title="Automated Reviews"
            description="Send review requests after jobs. Get more 5-star Google reviews on autopilot."
          />
        </div>

        {/* Social Proof */}
        <div className="max-w-4xl mx-auto mt-24 text-center">
          <p className="text-gray-500 mb-8">Trusted by 500+ contractors</p>
          <div className="flex items-center justify-center gap-12 flex-wrap">
            <Stat number="10,000+" label="Reviews Generated" />
            <Stat number="50,000+" label="Leads Captured" />
            <Stat number="98%" label="Response Rate" />
          </div>
        </div>

        {/* Pricing Preview */}
        <div className="max-w-xl mx-auto mt-24">
          <div className="card p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Simple Pricing</h2>
            <div className="flex items-baseline justify-center gap-1 mb-4">
              <span className="text-5xl font-bold text-gray-900">$297</span>
              <span className="text-gray-500">/month</span>
            </div>
            <p className="text-gray-600 mb-6">Everything you need to grow your business</p>
            <ul className="text-left space-y-3 mb-8">
              <PricingFeature text="Dedicated business phone number" />
              <PricingFeature text="Unlimited SMS & call forwarding" />
              <PricingFeature text="Automated review collection" />
              <PricingFeature text="Contact management & CRM" />
              <PricingFeature text="Real-time push notifications" />
              <PricingFeature text="Admin dashboard & analytics" />
            </ul>
            <Link href="/signup" className="btn-primary w-full text-lg py-3">
              Start Your Free Trial
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-12 mt-24 border-t border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">ContractorGrow</span>
          </div>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} ContractorGrow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="card p-6">
      <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-3xl font-bold text-gray-900">{number}</div>
      <div className="text-gray-500">{label}</div>
    </div>
  );
}

function PricingFeature({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3">
      <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0" />
      <span className="text-gray-700">{text}</span>
    </li>
  );
}
