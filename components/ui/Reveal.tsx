"use client";
import { motion, useReducedMotion } from "motion/react";

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();

  /* `initial` phải giống nhau ở server và client. Trước đây nó phụ thuộc
     useReducedMotion() — hàm này luôn trả false khi render trên server, nên
     người bật "giảm chuyển động" gặp hydration mismatch trên toàn bộ trang.
     Giữ initial cố định, chỉ rút thời lượng transition về 0. */
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
