import { readdirSync } from "node:fs";
import { join } from "node:path";

type PhoneSlide = {
  src: string;
  alt: string;
};

const groupNumber = /Group(\d+)/i;

export function getPhoneSlides(): PhoneSlide[] {
  const phoneDir = join(process.cwd(), "public", "phones");

  return readdirSync(phoneDir)
    .filter((file) => /\.(png|jpe?g|webp|avif)$/i.test(file))
    .sort((left, right) => {
      const leftMatch = left.match(groupNumber);
      const rightMatch = right.match(groupNumber);
      const leftNumber = leftMatch ? Number(leftMatch[1]) : 0;
      const rightNumber = rightMatch ? Number(rightMatch[1]) : 0;

      return leftNumber - rightNumber;
    })
    .map((file, index) => ({
      src: `/phones/${file}`,
      alt: `Playground ${index + 1}`,
    }));
}
