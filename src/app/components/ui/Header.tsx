'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link'; //  Add Next.js Link component

export default function Header() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: 'linear-gradient(45deg, #FFD700, #DDA0DD)',
        padding: '1rem 2rem',
        borderBottom: '2px solid rgba(0, 0, 0, 0.1)',
        boxSizing: 'border-box',
      }}
    >
      <motion.div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '2rem',
        }}
      >
        <h1 style={{ fontWeight: 'bold', color: '#191970' }}>
          Mystic Arcana
        </h1>
        <motion.ul
          style={{
            display: 'flex',
            listStyle: 'none',
            gap: '2rem',
          }}
        >
          <motion.li>
            <Link href="/" passHref>
              <motion.span
                whileHover={{ scale: 1.1 }}
                style={{
                  transition: '0.3s all ease',
                  color: 'white',
                  textDecoration: 'none' //  Remove redundant style
                }}
              >
                Horoscopes
              </motion.span>
            </Link>
          </motion.li>
          <motion.li>
            <Link href="/tarot" passHref>
              <motion.span
                whileHover={{ scale: 1.1 }}
                style={{
                  transition: '0.3s all ease',
                  color: 'white',
                  textDecoration: 'none' //  Remove redundant style
                }}
              >
                Tarot Reads
              </motion.span>
            </Link>
          </motion.li>
        </motion.ul>
      </motion.div>
    </motion.nav>
  );
}
