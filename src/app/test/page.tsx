import Link from 'next/link';
export default function TestPage() {
  return (
    <div style={{ background: 'black', color: 'white', padding: '2rem', minHeight: '100vh' }}>
      <h1>Test Page - App is Running!</h1>
      <p>If you can see this, the Next.js server is working correctly.</p>
      <p>Visit <Link href="/" style={{ color: '#FFD700' }}>Home Page</Link> to see the Cosmic Lobby.</p>
    </div>
  );
}
