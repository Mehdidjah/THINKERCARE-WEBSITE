import { motion } from "motion/react";

export const DeBlur = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ filter: "blur(20px) contrast(150%)" }}
      whileInView={{ filter: "blur(0px) contrast(100%)" }}
      transition={{ duration: 0.2, delay: 0.2, ease: "easeOut" }}
      viewport={{ margin: "-100px 0px -100px 0px" }}
    >
      {children}
    </motion.div>
  );
};
