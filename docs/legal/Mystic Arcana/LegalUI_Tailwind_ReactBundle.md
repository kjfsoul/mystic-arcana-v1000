// COMPONENT: LegalDocument.tsx
import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface LegalDocumentProps {
content: string
title: string
}

export const LegalDocument = ({ content, title }: LegalDocumentProps) => {
return (
<div className="max-w-4xl mx-auto px-4 py-12 text-white">
<h1 className="text-3xl font-bold mb-6 border-b border-white/20 pb-2">{title}</h1>
<div className="prose prose-invert prose-lg text-gray-100 prose-headings:text-white prose-a:text-amber-400">
<ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
</div>
</div>
)
}

// PAGES: pages/legal/[slug].tsx (for Next.js apps)
import fs from 'fs'
import path from 'path'
import { GetStaticPaths, GetStaticProps } from 'next'
import { LegalDocument } from '../../components/LegalDocument'

export default function LegalPage({ content, title }) {
return <LegalDocument content={content} title={title} />
}

export const getStaticPaths: GetStaticPaths = async () => {
const files = fs.readdirSync(path.join(process.cwd(), 'content/legal'))
const paths = files.map(file => ({
params: { slug: file.replace('.md', '') }
}))
return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
const slug = params?.slug
const filePath = path.join(process.cwd(), 'content/legal', `${slug}.md`)
const content = fs.readFileSync(filePath, 'utf-8')
const title = slug
.replace(/-/g, ' ')
.replace(/\b\w/g, c => c.toUpperCase())
return { props: { content, title } }
}

// USAGE & DEPLOYMENT NOTES

// Folder structure for markdown-based legal content:
content/
legal/
privacy.md
terms.md
cookies.md
disclaimer.md
community.md
agreement.md
affiliate.md
index.md

// Link in Footer Component (example)

<Link href="/legal/privacy">Privacy Policy</Link>
<Link href="/legal/terms">Terms</Link>
<Link href="/legal/cookies">Cookies</Link>
<Link href="/legal/disclaimer">Disclaimer</Link>

// Consent Modal example
<button onClick={() => router.push('/legal/terms')}>
Read Terms & Agree
</button>
