import { Stripe, loadStripe } from "@stripe/stripe-js";
let stripePromise: Promise<Stripe | null>;
const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      console.warn(
        "Stripe publishable key not found. Please add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your environment variables.",
      );
      return Promise.resolve(null);
    }

    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};
export default getStripe;
// Stripe configuration for Mystic Arcana products
export const STRIPE_CONFIG = {
  currency: "usd",
  payment_method_types: ["card"],
  billing_address_collection: "required",
  shipping_address_collection: {
    allowed_countries: [
      "US",
      "CA",
      "GB",
      "AU",
      "FR",
      "DE",
      "IT",
      "ES",
      "NL",
      "SE",
      "NO",
      "DK",
      "FI",
    ],
  },
};
// Celestial event types
export type CelestialEventType =
  | "mercury_retrograde"
  | "full_moon"
  | "new_moon"
  | "eclipse"
  | "conjunction"
  | "solstice"
  | "equinox"
  | "saturn_return"
  | "venus_retrograde"
  | "mars_retrograde";
export interface ProductMetadata {
  collection: string;
  type:
    | "fashion"
    | "crystals"
    | "tarot"
    | "jewelry"
    | "candles"
    | "books"
    | "oils";
  cosmic_alignment?: CelestialEventType[];
  limited_edition?: "true" | "false";
  zodiac_signs?: string[];
  element?: "fire" | "earth" | "air" | "water";
  moon_phase?: "waxing" | "full" | "waning" | "new";
}
// Product configurations
export const MYSTIC_PRODUCTS = {
  retrograde_collection: {
    name: "RETROGRADE Fashion Drop – Vintage Cosmic Collection",
    description:
      "Limited edition vintage-inspired fashion pieces aligned with Mercury Retrograde energy. Each piece is designed to help you navigate planetary reflection periods with style and cosmic awareness.",
    price: 8900, // $89.00 in cents
    currency: "usd",
    images: [
      "/images/products/retrograde-collection-main.jpg",
      "/images/products/retrograde-collection-detail1.jpg",
      "/images/products/retrograde-collection-detail2.jpg",
    ],
    metadata: {
      collection: "Mercury Retrograde 2025",
      type: "fashion",
      cosmic_alignment: ["mercury_retrograde"],
      limited_edition: "true",
      zodiac_signs: ["gemini", "virgo"],
      element: "air",
    } as ProductMetadata,
  },
  full_moon_crystal_set: {
    name: "Full Moon Manifestation Crystal Set",
    description:
      "Powerful crystals charged under the full moon for manifestation and amplification of intentions.",
    price: 6700, // $67.00
    currency: "usd",
    images: ["/images/products/full-moon-crystals.jpg"],
    metadata: {
      collection: "Lunar Collection",
      type: "crystals",
      cosmic_alignment: ["full_moon"],
      moon_phase: "full",
      element: "water",
    } as ProductMetadata,
  },
  eclipse_protection_candles: {
    name: "Eclipse Protection Ritual Candles",
    description:
      "Hand-poured candles infused with protective herbs for eclipse season rituals and energy clearing.",
    price: 2900, // $29.00
    currency: "usd",
    images: ["/images/products/eclipse-candles.jpg"],
    metadata: {
      collection: "Eclipse Season",
      type: "candles",
      cosmic_alignment: ["eclipse"],
      element: "fire",
    } as ProductMetadata,
  },
  saturn_return_journal: {
    name: "Saturn Return Guidance Journal",
    description:
      "A comprehensive journal with astrological insights and prompts for navigating your Saturn Return.",
    price: 3200, // $32.00
    currency: "usd",
    images: ["/images/products/saturn-journal.jpg"],
    metadata: {
      collection: "Life Transitions",
      type: "books",
      cosmic_alignment: ["saturn_return"],
      zodiac_signs: ["capricorn"],
      element: "earth",
    } as ProductMetadata,
  },
  venus_love_oil: {
    name: "Venus Love & Beauty Oil",
    description:
      "Luxurious botanical oil blend for self-love rituals and attracting romantic energy.",
    price: 4200, // $42.00
    currency: "usd",
    images: ["/images/products/venus-oil.jpg"],
    metadata: {
      collection: "Planetary Oils",
      type: "oils",
      cosmic_alignment: ["conjunction"],
      zodiac_signs: ["taurus", "libra"],
      element: "earth",
    } as ProductMetadata,
  },
  crystal_starter_kit: {
    name: "Mystic Crystal Starter Kit",
    description:
      "Curated collection of essential crystals for spiritual practice and energy work.",
    price: 4500, // $45.00
    currency: "usd",
    images: ["/images/products/crystal-kit.jpg"],
    metadata: {
      collection: "Essential Crystals",
      type: "crystals",
      element: "earth",
    } as ProductMetadata,
  },
  new_moon_intention_set: {
    name: "New Moon Intention Setting Kit",
    description:
      "Complete kit with journal, crystals, and candles for new moon manifestation rituals.",
    price: 5500, // $55.00
    currency: "usd",
    images: ["/images/products/new-moon-kit.jpg"],
    metadata: {
      collection: "Lunar Collection",
      type: "crystals",
      cosmic_alignment: ["new_moon"],
      moon_phase: "new",
      element: "water",
    } as ProductMetadata,
  },
  solstice_celebration_bundle: {
    name: "Winter Solstice Celebration Bundle",
    description:
      "Everything you need to honor the winter solstice with candles, crystals, and ritual tools.",
    price: 7800, // $78.00
    currency: "usd",
    images: ["/images/products/solstice-bundle.jpg"],
    metadata: {
      collection: "Seasonal Celebrations",
      type: "crystals",
      cosmic_alignment: ["solstice"],
      element: "fire",
    } as ProductMetadata,
  },
  tarot_deck_premium: {
    name: "Mystic Arcana Premium Tarot Deck",
    description:
      "Hand-illustrated 78-card tarot deck with cosmic artwork and guidebook.",
    price: 3500, // $35.00
    currency: "usd",
    images: ["/images/products/tarot-deck.jpg"],
    metadata: {
      collection: "Divination Tools",
      type: "tarot",
    } as ProductMetadata,
  },
  moon_phase_jewelry: {
    name: "Lunar Phase Jewelry Collection",
    description:
      "Elegant jewelry pieces featuring the phases of the moon, perfect for daily cosmic connection.",
    price: 6200, // $62.00
    currency: "usd",
    images: ["/images/products/moon-jewelry.jpg"],
    metadata: {
      collection: "Cosmic Jewelry",
      type: "jewelry",
      cosmic_alignment: ["full_moon", "new_moon"],
      element: "water",
    } as ProductMetadata,
  },
};
// Create Stripe checkout session
export const createCheckoutSession = async (
  productKey: keyof typeof MYSTIC_PRODUCTS,
) => {
  try {
    const product = MYSTIC_PRODUCTS[productKey];

    if (!product) {
      throw new Error("Product not found");
    }
    const response = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_data: {
          name: product.name,
          description: product.description,
          images: product.images,
          metadata: product.metadata,
        },
        unit_amount: product.price,
        currency: product.currency,
        quantity: 1,
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to create checkout session");
    }
    const { sessionId } = await response.json();

    const stripe = await getStripe();
    if (!stripe) {
      throw new Error("Stripe not initialized");
    }
    const result = await stripe.redirectToCheckout({
      sessionId: sessionId,
    });
    if (result.error) {
      throw new Error(result.error.message);
    }
    return { success: true };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
};
