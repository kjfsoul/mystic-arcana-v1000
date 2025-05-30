// components/OnboardingLegalModal.tsx
import React, { useState } from 'react'

export const OnboardingLegalModal = ({ documents, onAccept }) => {
  const [accepted, setAccepted] = useState(false)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg max-w-lg w-full">
        <h2 className="text-xl font-bold mb-4">Before You Celebrate...</h2>
        <p className="mb-4 text-sm text-gray-300">
          Please read and accept our core policies before sending cards or importing contacts:
        </p>
        <ul className="space-y-2 mb-4 text-sm text-blue-400">
          {documents.map((doc, idx) => (
            <li key={idx}>
              <a href={doc.href} target="_blank" rel="noopener noreferrer" className="underline">
                {doc.label}
              </a>
            </li>
          ))}
        </ul>
        <label className="text-sm flex items-center mb-4">
          <input type="checkbox" onChange={e => setAccepted(e.target.checked)} className="mr-2" />
          I have read and agree to the documents above.
        </label>
        <button
          className="bg-pink-500 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={!accepted}
          onClick={() => onAccept({ accepted, timestamp: new Date().toISOString() })}
        >
          Continue
        </button>
      </div>
    </div>
  )
}