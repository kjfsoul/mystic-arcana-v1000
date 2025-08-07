'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
export const EnhancedTarotCard = ({ card, isFlipped = false, isReversed = false, onFlip, disabled = false, size = 'medium', showBioluminescence = true, delay = 0, className = '' }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [glowIntensity, setGlowIntensity] = useState(0);
    const [particles, setParticles] = useState([]);
    // Size configurations
    const sizeConfig = {
        small: { width: 120, height: 180, fontSize: '12px' },
        medium: { width: 160, height: 240, fontSize: '14px' },
        large: { width: 200, height: 300, fontSize: '16px' }
    };
    const config = sizeConfig[size];
    // Generate bioluminescent particles
    useEffect(() => {
        if (showBioluminescence && (isHovered || isFlipped)) {
            const newParticles = Array.from({ length: 8 }, (_, i) => ({
                id: i,
                x: Math.random() * config.width,
                y: Math.random() * config.height,
                delay: Math.random() * 2
            }));
            setParticles(newParticles);
        }
        else {
            setParticles([]);
        }
    }, [isHovered, isFlipped, showBioluminescence, config.width, config.height]);
    // Dynamic glow effect
    useEffect(() => {
        if (isHovered || isFlipped) {
            const interval = setInterval(() => {
                setGlowIntensity(prev => (prev + 0.1) % 1);
            }, 100);
            return () => clearInterval(interval);
        }
        else {
            setGlowIntensity(0);
        }
    }, [isHovered, isFlipped]);
    const handleCardClick = () => {
        if (disabled)
            return;
        onFlip?.();
    };
    // Bioluminescent colors that shift
    const getBioluminescentGlow = () => {
        const colors = [
            'rgba(0, 255, 255, 0.3)', // Cyan
            'rgba(127, 255, 212, 0.3)', // Aquamarine  
            'rgba(173, 216, 230, 0.3)', // Light blue
            'rgba(144, 238, 144, 0.3)', // Light green
            'rgba(221, 160, 221, 0.3)' // Plum
        ];
        const colorIndex = Math.floor(glowIntensity * colors.length);
        return colors[colorIndex] || colors[0];
    };
    const cardVariants = {
        hidden: {
            rotateY: 180,
            scale: 0.8,
            opacity: 0
        },
        visible: {
            rotateY: isFlipped ? 0 : 180,
            scale: 1,
            opacity: 1,
            transition: {
                delay,
                duration: 0.8,
                type: 'spring',
                stiffness: 100,
                damping: 15
            }
        }
    };
    return (React.createElement(motion.div, { className: `relative cursor-pointer ${className}`, style: { width: config.width, height: config.height }, variants: cardVariants, initial: "hidden", animate: "visible", onHoverStart: () => setIsHovered(true), onHoverEnd: () => setIsHovered(false), onClick: handleCardClick, whileHover: disabled ? {} : { scale: 1.05, y: -10 }, whileTap: disabled ? {} : { scale: 0.95 } },
        showBioluminescence && (isHovered || isFlipped) && (React.createElement(motion.div, { className: "absolute inset-0 rounded-lg pointer-events-none", style: {
                background: `radial-gradient(circle, ${getBioluminescentGlow()} 0%, transparent 70%)`,
                filter: 'blur(8px)',
                transform: 'scale(1.2)'
            }, animate: {
                opacity: [0.3, 0.7, 0.3],
                scale: [1.1, 1.3, 1.1]
            }, transition: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
            } })),
        React.createElement(motion.div, { className: "relative w-full h-full preserve-3d", animate: { rotateY: isFlipped ? 180 : 0 }, transition: {
                duration: 0.8,
                type: 'spring',
                stiffness: 100,
                damping: 15
            }, style: { transformStyle: 'preserve-3d' } },
            React.createElement("div", { className: "absolute inset-0 w-full h-full backface-hidden rounded-lg overflow-hidden border-2 border-purple-500/30", style: {
                    backfaceVisibility: 'hidden',
                    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
                    boxShadow: isHovered
                        ? '0 0 20px rgba(139, 92, 246, 0.6), inset 0 0 20px rgba(251, 191, 36, 0.2)'
                        : '0 0 10px rgba(139, 92, 246, 0.3)'
                } },
                React.createElement(Image, { src: "/images/tarot/card-back.svg", alt: "Tarot card back", fill: true, className: "object-cover", sizes: `${config.width}px` }),
                React.createElement("div", { className: "absolute inset-0 opacity-30", style: {
                        background: `
                radial-gradient(circle at 25% 25%, rgba(251, 191, 36, 0.2) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.2) 0%, transparent 50%),
                linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.1) 50%, transparent 60%)
              `
                    } })),
            React.createElement("div", { className: "absolute inset-0 w-full h-full backface-hidden rounded-lg overflow-hidden border-2 border-amber-500/50", style: {
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
                    boxShadow: isFlipped
                        ? '0 0 30px rgba(251, 191, 36, 0.8), inset 0 0 30px rgba(139, 92, 246, 0.3)'
                        : '0 0 15px rgba(251, 191, 36, 0.4)'
                } },
                React.createElement("div", { className: "relative w-full h-full", style: {
                        transform: isReversed ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease-in-out'
                    } },
                    React.createElement(Image, { src: card.frontImage, alt: `${card.name}${isReversed ? ' (Reversed)' : ''}`, fill: true, className: "object-cover", sizes: `${config.width}px` }),
                    isReversed && (React.createElement("div", { className: "absolute top-2 right-2 bg-red-600/90 text-white px-2 py-1 rounded text-xs font-bold z-10", style: {
                            transform: 'rotate(180deg)',
                            fontSize: '10px'
                        } }, "REVERSED"))),
                React.createElement("div", { className: "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2" },
                    React.createElement("h3", { className: "text-white font-semibold text-center", style: { fontSize: config.fontSize } },
                        card.name,
                        isReversed && ' (R)')))),
        React.createElement(AnimatePresence, null, showBioluminescence && particles.map((particle) => (React.createElement(motion.div, { key: particle.id, className: "absolute pointer-events-none w-2 h-2 rounded-full", style: {
                left: particle.x,
                top: particle.y,
                background: 'radial-gradient(circle, rgba(0, 255, 255, 0.8) 0%, transparent 70%)',
                filter: 'blur(1px)'
            }, initial: { opacity: 0, scale: 0 }, animate: {
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
                y: [0, -50]
            }, exit: { opacity: 0, scale: 0 }, transition: {
                duration: 3,
                delay: particle.delay,
                repeat: Infinity,
                ease: 'easeOut'
            } })))),
        !disabled && (React.createElement(motion.div, { className: "absolute inset-0 pointer-events-none rounded-lg", initial: { opacity: 0 }, animate: {
                opacity: isHovered ? 0.1 : 0,
                background: isHovered ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
            }, transition: { duration: 0.2 } }))));
};
