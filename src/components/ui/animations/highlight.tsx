import { motion } from "motion/react";

export const Highlight = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative inline">
      {children}
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: "calc(100% + 8px)" }}
        transition={{ duration: 0.2, ease: "easeOut", delay: 0.2 }}
        viewport={{ margin: "-50px" }}
        className="absolute bottom-1 -left-1 -top-1 bg-primary -z-10"
      />
    </div>
  );
};
