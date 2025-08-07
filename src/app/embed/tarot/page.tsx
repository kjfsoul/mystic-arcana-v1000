'use client';
import { SpreadType } from '@/components/tarot/EnhancedTarotSpreadLayouts';
import { MobileTarotReader } from "@/components/tarot/MobileTarotReader";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
// EmbedPageProps interface removed - not used in this component
// Loading component for embed
const EmbedLoading = () => (
  <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
      <div className="text-purple-300 text-lg font-medium">
        Loading Cosmic Deck...
      </div>
    </div>
  </div>
);
// Main embed component
const TarotEmbedContent = () => {
  const searchParams = useSearchParams();
  const spread = searchParams.get('spread') as SpreadType || 'three-card';
  // const theme = searchParams.get('theme') || 'dark';
  // const size = searchParams.get('size') || 'mobile';
  // Handle sharing from embed
  const handleShare = (cards: any[], image: string) => {
    // Send message to parent window for social media sharing
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'TAROT_SHARE',
        data: { cards, image, spread, timestamp: Date.now() }
      }, '*');
    }
  };
  return (
    <div 
      className="w-full h-screen overflow-hidden"
      style={{
        // Ensure embed fills the iframe properly
        minHeight: '100vh',
        minWidth: '100vw'
      }}
    >
      <MobileTarotReader
        embedMode={true}
        showSocialActions={true}
        onShare={handleShare}
        className="w-full h-full"
      />
      
      {/* Embed-specific meta tags */}
      <style jsx global>{`
        html, body {
          margin: 0;
          padding: 0;
          overflow: hidden;
          height: 100%;
          width: 100%;
        }
        
        /* Disable text selection in embed */
        * {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }
        
        /* Optimize for touch devices */
        button, .tarot-card {
          touch-action: manipulation;
        }
        
        /* Prevent zoom on iOS */
        input, select, textarea {
          font-size: 16px !important;
        }
        
        /* Hide scrollbars */
        ::-webkit-scrollbar {
          display: none;
        }
        
        /* Smooth animations for embed */
        * {
          will-change: transform;
        }
      `}</style>
    </div>
  );
};
// Main page component with error boundary
export default function TarotEmbedPage() {
  return (
    <>
      {/* SEO and embed meta tags */}
      <head>
        <title>Mystic Arcana - Tarot Reading</title>
        <meta name="description" content="Get your personalized tarot reading with Mystic Arcana. Cosmic guidance for life's questions." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        
        {/* Open Graph for social media */}
        <meta property="og:title" content="Mystic Arcana - Tarot Reading" />
        <meta property="og:description" content="Experience cosmic guidance with our interactive tarot readings" />
        <meta property="og:image" content="/images/og-tarot-embed.jpg" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Mystic Arcana" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Mystic Arcana - Tarot Reading" />
        <meta name="twitter:description" content="Get your cosmic guidance with interactive tarot readings" />
        <meta name="twitter:image" content="/images/twitter-tarot-embed.jpg" />
        
        {/* Prevent indexing of embed pages */}
        <meta name="robots" content="noindex, nofollow" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/images/tarot/card-back.svg" as="image" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#1e1b4b" />
        <meta name="msapplication-navbutton-color" content="#1e1b4b" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Disable iOS zoom */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      
      <Suspense fallback={<EmbedLoading />}>
        <TarotEmbedContent />
      </Suspense>
    </>
  );
}
