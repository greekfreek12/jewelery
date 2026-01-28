"use client";

import { Shield, Clock, ThumbsUp, Award } from "lucide-react";
import type { SectionProps, TrustBadgesContent } from "@/types/site";

const ICON_MAP: Record<string, React.ElementType> = {
  shield: Shield,
  clock: Clock,
  thumbsup: ThumbsUp,
  award: Award,
};

export function TrustBadgesSection({
  content,
  globalConfig,
  businessData,
}: SectionProps<TrustBadgesContent>) {
  // Build badges dynamically based on actual data
  const badges = content?.badges ?? [
    { icon: "shield", text: "Licensed & Insured" },
    { icon: "clock", text: "Same-Day Service" },
    { icon: "thumbsup", text: "Satisfaction Guaranteed" },
  ];

  return (
    <section className="py-6" style={{ backgroundColor: "#161B22" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {badges.map((badge, index) => {
            const IconComponent = ICON_MAP[badge.icon] ?? Shield;
            return (
              <div key={index} className="flex items-center gap-3">
                <IconComponent
                  className="w-5 h-5 flex-shrink-0"
                  style={{ color: globalConfig.accent_color }}
                />
                <span
                  className="text-sm font-semibold uppercase tracking-wider whitespace-nowrap"
                  style={{
                    fontFamily: `"${globalConfig.font_body}", sans-serif`,
                    color: "#7D8590",
                  }}
                >
                  {badge.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
