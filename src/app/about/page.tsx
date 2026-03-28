"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

export default function AboutPage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const onScroll = () => {
      if (!stageRef.current || revealed) {
        return;
      }

      const rect = stageRef.current.getBoundingClientRect();
      const viewport = window.innerHeight;
      const progress = (viewport - rect.top) / (viewport + rect.height);

      if (progress > 0.34) {
        timeoutId = setTimeout(() => {
          setRevealed(true);
        }, 420);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [revealed]);

  return (
    <main className={styles.page}>
      <section className={styles.scrollStage} ref={stageRef}>
        <div className={styles.stickyCard}>
          <div className={`${styles.wrap} ${revealed ? styles.revealed : ""}`}>
            <p className={styles.step}>02/05</p>

            <h1 className={styles.title}>
              <span className={styles.slash}>/</span>ABOUT
            </h1>

            <div className={styles.contentRow}>
              <div className={styles.arrow} aria-hidden="true" />

              <div className={styles.textBlock}>
                <p>
                  "Gared Matthew is a talented Freelance Designer &amp; Developer,
                  known for his creative prowess and technical expertise. With a
                  passion for crafting visually stunning and functional digital
                  experiences, Gared combines design aesthetics with coding finesse
                  to bring his clients' visions to life. Whether it's building
                  websites, designing user interfaces, or optimizing user
                  experiences, Gared's dedication to excellence and innovation
                  shines through in every project he undertakes."
                </p>

                <p className={styles.meta}>
                  CURRENTLY WORKING WITH LOOM CORPORATE AS A PRODUCT DESIGNER
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
