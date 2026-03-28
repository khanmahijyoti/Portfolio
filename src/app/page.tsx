"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  const heroText = "Khan Mahi";
  const heroRef = useRef<HTMLElement>(null);
  const aboutStageRef = useRef<HTMLElement>(null);
  const processStageRef = useRef<HTMLElement>(null);
  const [aboutRevealed, setAboutRevealed] = useState(false);
  const [processRevealed, setProcessRevealed] = useState(false);
  const aboutRevealedRef = useRef(false);
  const processRevealedRef = useRef(false);

  useEffect(() => {
    aboutRevealedRef.current = aboutRevealed;
  }, [aboutRevealed]);

  useEffect(() => {
    processRevealedRef.current = processRevealed;
  }, [processRevealed]);

  useEffect(() => {
    const hero = heroRef.current;
    const aboutStage = aboutStageRef.current;
    const processStage = processStageRef.current;

    if (!hero || !aboutStage || !processStage) {
      return;
    }

    const WHEEL_TRIGGER_DELTA = 8;
    const SNAP_DOWN_DURATION = 820;
    const SNAP_UP_DURATION = 760;
    const SNAP_LOCK_DURATION = 920;
    const ABOUT_REVEAL_DELAY = 260;
    const PROCESS_REVEAL_DELAY = 260;

    let lockTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let revealTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let snapFrameId = 0;
    let settleFrameId = 0;
    let scrollLocked = false;

    const getPanelTop = (element: HTMLElement) =>
      Math.round(window.scrollY + element.getBoundingClientRect().top);

    const clearTimers = () => {
      if (lockTimeoutId) {
        clearTimeout(lockTimeoutId);
        lockTimeoutId = null;
      }
      if (revealTimeoutId) {
        clearTimeout(revealTimeoutId);
        revealTimeoutId = null;
      }
      window.cancelAnimationFrame(snapFrameId);
      window.cancelAnimationFrame(settleFrameId);
    };

    const settleToPanel = (element: HTMLElement, passes = 6) => {
      let remaining = passes;

      const settle = () => {
        const resolvedTarget = getPanelTop(element);
        window.scrollTo(0, resolvedTarget);
        remaining -= 1;

        if (remaining > 0) {
          settleFrameId = window.requestAnimationFrame(settle);
          return;
        }

        scrollLocked = false;
      };

      settleFrameId = window.requestAnimationFrame(settle);
    };

    const smoothScrollTo = (targetY: number, duration: number) => {
      const startY = window.scrollY;
      const distance = targetY - startY;
      const startTime = performance.now();

      if (Math.abs(distance) < 1) {
        window.scrollTo(0, targetY);
        return;
      }

      const easeInOutCubic = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const step = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = easeInOutCubic(progress);
        window.scrollTo(0, startY + distance * eased);

        if (progress < 1) {
          snapFrameId = window.requestAnimationFrame(step);
          return;
        }

        window.scrollTo(0, targetY);
      };

      snapFrameId = window.requestAnimationFrame(step);
    };

    const snapToPanel = (
      element: HTMLElement,
      duration: number,
      revealAbout = false,
      revealProcess = false,
    ) => {
      scrollLocked = true;
      smoothScrollTo(getPanelTop(element), duration);

      if (revealAbout) {
        revealTimeoutId = setTimeout(() => {
          setAboutRevealed(true);
          revealTimeoutId = null;
        }, ABOUT_REVEAL_DELAY);
      }

      if (revealProcess) {
        revealTimeoutId = setTimeout(() => {
          setProcessRevealed(true);
          revealTimeoutId = null;
        }, PROCESS_REVEAL_DELAY);
      }

      lockTimeoutId = setTimeout(() => {
        settleToPanel(element);
      }, SNAP_LOCK_DURATION);
    };

    const getActivePanel = () => {
      const y = window.scrollY;
      const heroTop = getPanelTop(hero);
      const aboutTop = getPanelTop(aboutStage);
      const processTop = getPanelTop(processStage);
      const heroAboutMidpoint = (heroTop + aboutTop) / 2;
      const aboutProcessMidpoint = (aboutTop + processTop) / 2;

      if (y < heroAboutMidpoint) {
        return 0;
      }

      if (y < aboutProcessMidpoint) {
        return 1;
      }

      return 2;
    };

    const onWheel = (event: WheelEvent) => {
      if (scrollLocked) {
        event.preventDefault();
        return;
      }

      if (Math.abs(event.deltaY) < WHEEL_TRIGGER_DELTA) {
        return;
      }

      event.preventDefault();
      clearTimers();

      const panel = getActivePanel();
      const goingDown = event.deltaY > 0;

      if (goingDown) {
        if (panel === 0) {
          setAboutRevealed(false);
          aboutRevealedRef.current = false;
          setProcessRevealed(false);
          processRevealedRef.current = false;
          snapToPanel(aboutStage, SNAP_DOWN_DURATION, true, false);
          return;
        }

        if (panel === 1) {
          setAboutRevealed(false);
          aboutRevealedRef.current = false;
          setProcessRevealed(false);
          processRevealedRef.current = false;
          snapToPanel(processStage, SNAP_DOWN_DURATION, false, true);
          return;
        }

        return;
      }

      if (panel === 2 && processRevealedRef.current) {
        setProcessRevealed(false);
        processRevealedRef.current = false;
        return;
      }

      if (panel === 2 && !processRevealedRef.current) {
        setAboutRevealed(false);
        aboutRevealedRef.current = false;
        snapToPanel(aboutStage, SNAP_UP_DURATION, true, false);
        return;
      }

      if (panel === 1 && aboutRevealedRef.current) {
        setAboutRevealed(false);
        aboutRevealedRef.current = false;
        return;
      }

      if (panel === 1 && !aboutRevealedRef.current) {
        snapToPanel(hero, SNAP_UP_DURATION);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel);
      clearTimers();
    };
  }, []);

  return (
    <main className={styles.page}>
      <section className={styles.viewport} ref={heroRef}>
        <nav className={styles.navbar} aria-label="Main">
          <div className={styles.navLinks}>
            <a href="#about">About</a>
            <a href="#about">Projects</a>
            <a href="#contact">Contact</a>
          </div>
        </nav>

        <section className={styles.card}>
          <figure className={styles.centerImage}>
            <Image
              src="/upscaled.png"
              alt="Person placeholder"
              fill
              priority
              className={styles.personImage}
            />
          </figure>

          <div className={styles.socialStack}>
            <a href="#" aria-label="Twitter">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22 5.8c-.7.3-1.5.5-2.3.6.8-.5 1.4-1.2 1.7-2.1-.8.5-1.7.8-2.6 1-1.6-1.7-4.3-1.5-5.7.3-.8 1.1-1.1 2.4-.7 3.7-3-.2-5.7-1.7-7.5-4.2-1 1.8-.5 4 1.2 5.2-.6 0-1.2-.2-1.7-.5v.1c0 2 1.4 3.8 3.4 4.2-.6.2-1.2.2-1.8.1.5 1.7 2.1 2.9 3.9 3-1.5 1.2-3.4 1.8-5.3 1.8H2c1.9 1.2 4.2 1.9 6.5 1.9 7.8 0 12-6.5 12-12.1v-.6c.8-.6 1.4-1.2 1.9-2z" />
              </svg>
            </a>
            <a href="#" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6.2 8.6H3.1V21h3.1V8.6zM4.7 3A1.8 1.8 0 1 0 4.7 6.6 1.8 1.8 0 0 0 4.7 3zM21 13.9c0-3.3-1.8-5.4-4.7-5.4-1.4 0-2.4.8-2.9 1.5V8.6h-3V21h3.1v-6.1c0-1.6.3-3.2 2.3-3.2 2 0 2 1.9 2 3.3V21H21v-7.1z" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 7.1A4.9 4.9 0 1 0 12 17a4.9 4.9 0 0 0 0-9.9zm0 8.1A3.2 3.2 0 1 1 12 8.8a3.2 3.2 0 0 1 0 6.4zm5.3-8.3a1.1 1.1 0 1 1-2.3 0 1.1 1.1 0 0 1 2.3 0z" />
                <path d="M12 2.9h3.3c3 0 5.4 2.4 5.4 5.4v7.4c0 3-2.4 5.4-5.4 5.4H8.7a5.4 5.4 0 0 1-5.4-5.4V8.3c0-3 2.4-5.4 5.4-5.4H12zm0-1.9H8.7a7.3 7.3 0 0 0-7.3 7.3v7.4A7.3 7.3 0 0 0 8.7 23h6.6a7.3 7.3 0 0 0 7.3-7.3V8.3A7.3 7.3 0 0 0 15.3 1H12z" />
              </svg>
            </a>
          </div>

          <div className={styles.subtitleBlock}>
            <p>Web Designer</p>
            <p>Game Developer</p>
          </div>
        </section>

        <h1 className={styles.heroTitleViewport}>
          {heroText.split("").map((char, index) => (
            <span
              key={`base-${index}`}
              className={styles.heroChar}
              style={{ animationDelay: `${420 + index * 70}ms` }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </h1>
        <h1 className={styles.heroTitleGlass} aria-hidden="true">
          {heroText.split("").map((char, index) => (
            <span
              key={`glass-${index}`}
              className={styles.heroChar}
              style={{ animationDelay: `${420 + index * 70}ms` }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </h1>
      </section>

      <section id="about" className={styles.aboutStage} ref={aboutStageRef}>
        <div className={styles.aboutStickyCard}>
          <div
            className={`${styles.aboutWrap} ${aboutRevealed ? styles.aboutRevealed : ""}`}
          >
            <p className={styles.aboutStep}>02/05</p>

            <h2 className={styles.aboutTitle}>
              <span className={styles.aboutSlash}>/</span>ABOUT
            </h2>

            <div className={styles.aboutContentRow}>
              <div className={styles.aboutArrow} aria-hidden="true" />

              <div className={styles.aboutTextBlock}>
                <p>
                  "Gared Matthew is a Freelance Designer &amp; Developer focused on
                  crafting clean, high-impact digital experiences. He blends strong
                  visual design with technical execution to build websites,
                  interfaces, and products that feel both elegant and practical."
                </p>

                <p className={styles.aboutMeta}>
                  CURRENTLY WORKING WITH LOOM CORPORATE AS A PRODUCT DESIGNER
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.processSection} ref={processStageRef}>
        <div
          className={`${styles.processCard} ${processRevealed ? styles.processCardRevealed : ""}`}
        >
          <div className={styles.processWrap}>
            <h2 className={styles.processHeading}>
              <p className={styles.processActive}>DEFINE</p>
              <p className={styles.processMuted}>DESIGN</p>
              <p className={styles.processMuted}>DELIVER</p>
            </h2>

            <p className={styles.processText}>
              Gared collaborates closely with the client to define the project&apos;s
              scope, objectives, and requirements. He conducts thorough research to
              gain insights and clarity, setting a solid foundation for the design
              and development work ahead.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
