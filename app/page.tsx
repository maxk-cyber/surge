"use client";

import dynamic from "next/dynamic";
import { AvatarPicker } from "@/components/game/AvatarPicker";
import { avatarGalleryImages, avatarScrollImages } from "@/lib/gallery-images";

const DomeGallery = dynamic(() => import("@/components/ui/DomeGallery"), { ssr: false });
const FluidGlass = dynamic(() => import("@/components/ui/FluidGlass"), { ssr: false });

const galleryImages = avatarGalleryImages();
const scrollImages = avatarScrollImages(5);

export default function CardGalleryPage() {
  return (
    <main className="min-h-screen">
      <header className="relative z-20 px-6 py-10 text-center">
        <p className="font-body text-[10px] uppercase tracking-[0.35em] text-secondary">
          Snack Surge · Lite
        </p>
        <h1 className="mt-2 font-display text-3xl uppercase tracking-[0.12em] text-foreground md:text-5xl">
          Fighter Card Gallery
        </h1>
        <p className="mx-auto mt-3 max-w-xl font-body text-sm text-secondary/90">
          Browse mutant cafeteria fighters on the dome globe, scroll through avatars in fluid glass,
          and inspect full trading cards below — no game, just the showcase.
        </p>
      </header>

      <section id="globe" className="gallery-section relative h-[min(88vh,920px)] w-full">
        <DomeGallery
          images={galleryImages}
          fit={0.48}
          minRadius={420}
          overlayBlurColor="#0a0a0a"
          grayscale={false}
          imageBorderRadius="18px"
          openedImageBorderRadius="18px"
          openedImageWidth="280px"
          openedImageHeight="380px"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-8 z-30 text-center">
          <p className="font-body text-[10px] uppercase tracking-[0.25em] text-secondary/80">
            Drag to spin · tap a tile to enlarge
          </p>
        </div>
      </section>

      <section id="glass" className="gallery-section relative mx-auto w-full max-w-6xl px-4 py-16">
        <div className="mb-6 text-center">
          <h2 className="font-display text-2xl uppercase tracking-[0.1em]">Fluid Glass</h2>
          <p className="mt-2 font-body text-xs text-secondary">
            Hover the panel and scroll to move through fighters · lens follows your cursor
          </p>
        </div>
        <div
          className="relative overflow-hidden rounded-2xl border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
          style={{ background: "#5227ff" }}
        >
          <div style={{ height: "600px", position: "relative" }}>
            <FluidGlass
              mode="lens"
              title="Snack Surge"
              imageUrls={scrollImages}
              lensProps={{
                scale: 0.25,
                ior: 1.15,
                thickness: 5,
                chromaticAberration: 0.1,
                anisotropy: 0.01,
              }}
            />
          </div>
        </div>
      </section>

      <section
        id="cards"
        className="gallery-section mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-24 pt-8"
      >
        <div className="mb-8 text-center">
          <h2 className="font-display text-2xl uppercase tracking-[0.1em]">Trading Cards</h2>
          <p className="mt-2 font-body text-xs text-secondary">
            Full fighter stats with PNG portrait art
          </p>
        </div>
        <AvatarPicker />
      </section>
    </main>
  );
}
