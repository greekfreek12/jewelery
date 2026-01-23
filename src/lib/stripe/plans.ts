// Plan configuration - can be imported by client components
export const PLANS = {
  contractor: {
    name: "Contractor Growth Platform",
    description: "SMS inbox, call forwarding, review automation",
    price: 29700, // $297.00 in cents
    interval: "month" as const,
    features: [
      "Dedicated business phone number",
      "Unlimited SMS messaging",
      "Call forwarding to your cell",
      "Missed call auto-text",
      "Review request automation",
      "Review drip campaigns",
      "Contact management",
      "Real-time notifications",
    ],
  },
};
