'use client';

import { motion, HTMLMotionProps, Variants, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

// Animation variants for reuse
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

// Default transition
export const defaultTransition = {
  duration: 0.4,
  ease: [0.25, 0.46, 0.45, 0.94] as const,
};

export const springTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 20,
};

// Page Transition Wrapper
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={defaultTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Animated Card Component
interface AnimatedCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  delay?: number;
  hover?: boolean;
}

export function AnimatedCard({
  children,
  delay = 0,
  hover = true,
  className = '',
  ...props
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const, delay }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Animated List Container
interface AnimatedListProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedList({ children, className = '' }: AnimatedListProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Animated List Item
interface AnimatedListItemProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
}

export function AnimatedListItem({
  children,
  className = '',
  ...props
}: AnimatedListItemProps) {
  return (
    <motion.div variants={staggerItem} className={className} {...props}>
      {children}
    </motion.div>
  );
}

// Hover Scale Button/Element
interface HoverScaleProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  scale?: number;
}

export function HoverScale({
  children,
  className = '',
  scale = 1.02,
  ...props
}: HoverScaleProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Animated Icon Container
interface AnimatedIconProps {
  children: ReactNode;
  className?: string;
  pulse?: boolean;
}

export function AnimatedIcon({
  children,
  className = '',
  pulse = false,
}: AnimatedIconProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.1, rotate: 5 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      animate={pulse ? { scale: [1, 1.05, 1] } : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Animated Counter (for numbers)
interface CounterProps {
  value: number;
  className?: string;
  formatter?: (value: number) => string;
}

export function AnimatedCounter({
  value,
  className = '',
  formatter = (v) => v.toLocaleString(),
}: CounterProps) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {formatter(value)}
    </motion.span>
  );
}

// Glass Skeleton Loading
export function GlassSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-gradient-to-r from-white/40 via-white/60 to-white/40
                  bg-[length:200%_100%] animate-shimmer rounded-xl ${className}`}
    />
  );
}

// Animated Modal
interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function AnimatedModal({ isOpen, onClose, children }: AnimatedModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="modal-overlay"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Fade In When Visible (for scroll animations)
interface FadeInWhenVisibleProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function FadeInWhenVisible({
  children,
  className = '',
  delay = 0,
}: FadeInWhenVisibleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Floating Animation (for decorative elements)
interface FloatingProps {
  children: ReactNode;
  className?: string;
  duration?: number;
}

export function Floating({
  children,
  className = '',
  duration = 3,
}: FloatingProps) {
  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Spinning Loader
interface SpinnerProps {
  className?: string;
  size?: number;
}

export function Spinner({ className = '', size = 24 }: SpinnerProps) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={className}
      style={{ width: size, height: size }}
    >
      <svg
        className="w-full h-full text-pineapple"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </motion.div>
  );
}

// Slide Toggle (for expand/collapse)
interface SlideToggleProps {
  isOpen: boolean;
  children: ReactNode;
  className?: string;
}

export function SlideToggle({ isOpen, children, className = '' }: SlideToggleProps) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={`overflow-hidden ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Pulse Animation (for notifications/badges)
interface PulseProps {
  children: ReactNode;
  className?: string;
}

export function Pulse({ children, className = '' }: PulseProps) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
        opacity: [1, 0.8, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Re-export AnimatePresence for convenience
export { AnimatePresence };
