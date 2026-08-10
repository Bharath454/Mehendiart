"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Dot {
  id: number;
  x: number;
  y: number;
  size: number;
}

interface ClickAnimation {
  id: number;
  x: number;
  y: number;
}

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState<Dot[]>([]);
  const [clicks, setClicks] = useState<ClickAnimation[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);
  const dotIdCounter = useRef(0);
  const clickIdCounter = useRef(0);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Enable on all non-touch devices (desktops/laptops with a mouse)
    const isTouchDevice = 
      typeof window !== "undefined" && (
        'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      );
    
    if (isTouchDevice) return;
    
    setIsMounted(true);
    document.body.classList.add("md:custom-cursor-active");
    
    const onMouseMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;
      setPosition({ x, y });

      // Only add trail dot if moved a minimum distance to prevent cluttering
      const dist = Math.hypot(x - lastPos.current.x, y - lastPos.current.y);
      if (dist > 10) {
        dotIdCounter.current += 1;
        const newDot: Dot = {
          id: dotIdCounter.current,
          x,
          y,
          size: Math.random() * 3 + 2, // 2px to 5px
        };
        setTrail((prev) => [...prev.slice(-12), newDot]); // Keep last 12 dots
        lastPos.current = { x, y };
      }
    };

    const onClick = (e: MouseEvent) => {
      clickIdCounter.current += 1;
      const newClick: ClickAnimation = {
        id: clickIdCounter.current,
        x: e.clientX,
        y: e.clientY,
      };
      setClicks((prev) => [...prev, newClick]);
      // Remove after animation finishes
      setTimeout(() => {
        setClicks((prev) => prev.filter((c) => c.id !== newClick.id));
      }, 600);
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || typeof target.tagName !== "string") return;
      const isClickable =
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.onclick != null ||
        (typeof target.closest === "function" && (
          target.closest("button") != null ||
          target.closest("a") != null
        )) ||
        (typeof target.getAttribute === "function" && target.getAttribute("role") === "button");
      setIsHoveringClickable(!!isClickable);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("click", onClick);
    window.addEventListener("mouseover", onMouseOver);

    // Dynamic style to hide real cursor on all non-touch devices
    const style = document.createElement("style");
    style.innerHTML = `
      body, a, button, [role="button"], input, select, textarea, label {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("mouseover", onMouseOver);
      document.body.classList.remove("md:custom-cursor-active");
      document.head.removeChild(style);
    };
  }, []);

  // Periodic cleanup of trail dots (fading trail)
  useEffect(() => {
    if (trail.length === 0) return;
    const interval = setInterval(() => {
      setTrail((prev) => prev.slice(1));
    }, 70);
    return () => clearInterval(interval);
  }, [trail]);

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {/* Mehendi Trail Dots */}
      {trail.map((dot) => (
        <motion.div
          key={dot.id}
          className="absolute rounded-full bg-mehendi-olive/40"
          style={{
            left: dot.x,
            top: dot.y,
            width: dot.size,
            height: dot.size,
            x: "-50%",
            y: "-50%",
          }}
          initial={{ opacity: 0.5, scale: 1 }}
          animate={{ opacity: 0, scale: 0.2 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      ))}

      {/* Mehendi Click Mandala Animations */}
      <AnimatePresence>
        {clicks.map((click) => (
          <motion.div
            key={click.id}
            className="absolute"
            style={{
              left: click.x,
              top: click.y,
              x: "-50%",
              y: "-50%",
            }}
            initial={{ scale: 0, opacity: 0.8, rotate: 0 }}
            animate={{ scale: 1.4, opacity: 0, rotate: 30 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Henna Flower SVG */}
            <svg
              width="60"
              height="60"
              viewBox="0 0 60 60"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="1.5"
              className="opacity-70"
            >
              <circle cx="30" cy="30" r="4" fill="#D4AF37" />
              <path d="M30 14 C28 20, 32 20, 30 24 C28 20, 32 20, 30 14" />
              <path d="M30 46 C28 40, 32 40, 30 36 C28 40, 32 40, 30 46" />
              <path d="M14 30 C20 28, 20 32, 24 30 C20 28, 20 32, 14 30" />
              <path d="M46 30 C40 28, 40 32, 36 30 C40 28, 40 32, 46 30" />
              <path d="M19 19 C23 23, 23 23, 25 25 C23 23, 23 23, 19 19" />
              <path d="M41 41 C37 37, 37 37, 35 35 C37 37, 37 37, 41 41" />
              <path d="M19 41 C23 37, 23 37, 25 35 C23 37, 23 37, 19 41" />
              <path d="M41 19 C37 23, 37 23, 35 25 C37 23, 37 23, 41 19" />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Mehendi Cone Cursor */}
      <motion.div
        className="absolute"
        style={{
          left: position.x,
          top: position.y,
          x: -11, // Centered horizontal alignment (wherever the cone touches is clickable)
          y: -17.5, // Centered vertical alignment (wherever the cone touches is clickable)
        }}
        animate={{
          scale: isHoveringClickable ? 1.25 : 1.0,
          rotate: isHoveringClickable ? -20 : 0,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Mehendi Cone SVG */}
        <svg
          width="22"
          height="35"
          viewBox="0 0 28 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)]"
        >
          {/* Cone Body */}
          <path
            d="M2 2L26 8L5 40L2 2Z"
            fill="url(#coneGrad)"
            stroke="#1A2E22"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Traditional patterns on the cone wrapping */}
          <path
            d="M5 11L21 15M6 17L17 20M7 23L13 25"
            stroke="#D4AF37"
            strokeWidth="1"
            strokeLinecap="round"
          />
          {/* Pasted Henna tip */}
          <path
            d="M5 40L2 43"
            stroke="#1A2E22"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Metallic Gold Tie Ribbon */}
          <ellipse cx="14" cy="5" rx="12" ry="2.5" fill="#D4AF37" stroke="#AA8C2C" strokeWidth="0.5" />
          
          <defs>
            <linearGradient id="coneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#355E3B" />
              <stop offset="60%" stopColor="#556B2F" />
              <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </div>
  );
}
