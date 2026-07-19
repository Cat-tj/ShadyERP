import { LandingContent } from "@/components/landing/landing-content";
import { getLandingSeo } from "@/lib/landing/vertical-content";
import { VERTICAL_MAP } from "@/lib/verticals";

/**
 * E-commerce starts from the established retail foundation. Keeping this
 * landing on the shared composition prevents a second, conflicting catalog
 * story while marketplace connectors are still a separate product milestone.
 */
export function EcommerceLanding() {
  const vertical = VERTICAL_MAP.ecommerce;

  return (
    <LandingContent
      vertical={vertical}
      faqItems={getLandingSeo(vertical).faqs}
    />
  );
}
