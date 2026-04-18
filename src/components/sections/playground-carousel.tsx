"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

type Slide = {
  src: string;
  alt: string;
};

export const PlaygroundCarousel = ({ slides }: { slides: Slide[] }) => {
  return (
    <div className="relative">
      <Swiper
        loop={slides.length > 1}
        width={300}
        className="rounded-3xl -mb-4"
        modules={[Pagination, Autoplay]}
        autoplay={slides.length > 1 ? { delay: 2500 } : false}
        pagination={{
          clickable: true,
          bulletClass: "swiper-pagination-bullet !bg-gray-400 !opacity-50",
          bulletActiveClass:
            "swiper-pagination-bullet-active !bg-black !opacity-100",
          bulletElement: "div",
        }}
        spaceBetween={32}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={`slide-${index}`} className="mx-8">
            <img src={slide.src} alt={slide.alt} />
          </SwiperSlide>
        ))}
      </Swiper>

      <style>{`
        .swiper-pagination {
          position: relative !important;
          margin-top: 40px !important;
          text-align: center !important;
        }

        .swiper-pagination-bullet {
          width: 12px !important;
          height: 12px !important;
          margin: 0 4px !important;
          border-radius: 50% !important;
          transition: all 0.3s ease !important;
        }

        .swiper-pagination-bullet-active {
          transform: scale(1.2) !important;
        }
      `}</style>
    </div>
  );
};
