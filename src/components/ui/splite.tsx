"use client"

import { Suspense, lazy } from "react"
import type { Application } from "@splinetool/runtime"

const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
  backgroundColor?: string
}

export function SplineScene({ scene, className, backgroundColor }: SplineSceneProps) {
  function handleLoad(spline: Application) {
    if (backgroundColor) {
      spline.setBackgroundColor(backgroundColor)
    }
  }

  return (
    <Suspense 
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <span className="loader"></span>
        </div>
      }
    >
      <Spline
        scene={scene}
        className={className}
        onLoad={handleLoad}
      />
    </Suspense>
  )
}
