"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Loader2, ArrowRight, Phone, MessageSquare, Star, Users } from "lucide-react";
import { PLANS } from "@/lib/stripe/plans";

export default function PricingPage() {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 401) {
          // Not logged in, redirect to signup
          window.location.href = "/signup?redirect=/pricing";
          return;
        }
        throw new Error(error.message);
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Subscription error:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white py-4">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            <span className="text-amber-500">Contractor</span>Growth
          </Link>
          <div className="space-x-4">
            <Link href="/login" className="text-slate-300 hover:text-white">
              Login
            </Link>
            <Link href="/signup" className="btn-accent text-sm">
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Stop Missing Jobs.
            <br />
            <span className="text-amber-500">Start Growing.</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            The all-in-one platform for contractors who want to capture more leads,
            respond faster, and get more 5-star reviews.
          </p>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="py-16 px-6">
        <div className="max-w-md mx-auto">
          <div className="card overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900 text-white p-8 text-center">
              <h2 className="text-2xl font-bold mb-2">{PLANS.contractor.name}</h2>
              <div className="flex items-baseline justify-center gap-1 mb-4">
                <span className="text-5xl font-bold">$297</span>
                <span className="text-slate-400">/month</span>
              </div>
              <p className="text-amber-500 font-medium">14-day free trial included</p>
            </div>

            {/* Features */}
            <div className="p-8">
              <h3 className="font-semibold text-slate-700 mb-4 text-sm uppercase tracking-wide">
                Everything you need:
              </h3>
              <ul className="space-y-4">
                {PLANS.contractor.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="btn-primary w-full mt-8 text-lg py-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Start 14-Day Free Trial
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-slate-500 mt-4">
                No credit card required to start. Cancel anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Why Contractors Love Us
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ValueProp
              icon={Phone}
              title="Never Miss a Call"
              description="Calls forward to your cell. Miss one? Auto-text goes out instantly."
            />
            <ValueProp
              icon={MessageSquare}
              title="Respond in Seconds"
              description="All texts in one inbox. Push notifications ensure you see every lead."
            />
            <ValueProp
              icon={Star}
              title="More 5-Star Reviews"
              description="Automated review requests. Drip campaigns that actually work."
            />
            <ValueProp
              icon={Users}
              title="Organized Contacts"
              description="Every lead, customer, and past job in one searchable database."
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Common Questions
          </h2>
          <div className="space-y-6">
            <FAQ
              question="What if I already have a business phone number?"
              answer="We'll give you a new dedicated number that forwards calls to your existing cell. Keep using your current number for outbound calls if you prefer."
            />
            <FAQ
              question="Can I cancel anytime?"
              answer="Yes, cancel with one click anytime. No contracts, no hidden fees. If you cancel, you keep access until the end of your billing period."
            />
            <FAQ
              question="How does the free trial work?"
              answer="You get full access to everything for 14 days. We'll remind you before it ends. Only pay if you decide to continue."
            />
            <FAQ
              question="Do I need to be tech-savvy?"
              answer="Not at all. We set up everything for you. The app is designed for busy contractors, not tech experts."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-slate-900 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Stop Missing Opportunities?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join hundreds of contractors who are capturing more leads and growing their business.
          </p>
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="btn-accent text-lg px-8 py-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}

function ValueProp({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-amber-600" />
      </div>
      <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm">{description}</p>
    </div>
  );
}

function FAQ({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <h3 className="font-semibold text-slate-900 mb-2">{question}</h3>
      <p className="text-slate-600">{answer}</p>
    </div>
  );
}
