import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";

/**
 * GPU-free versions of directional-blur transitions (CSS transform + filter), so the film renders fast on
 * machines without WebGL. Same look as @remotion/transitions linear-blur / blur-slide, tuned subtle.
 */
type P = { axis: "x" | "y"; travel: number; blur: number };

const Comp: React.FC<TransitionPresentationComponentProps<P>> = ({ children, presentationDirection, presentationProgress, passedProps }) => {
  const style = useMemo<React.CSSProperties>(() => {
    const p = presentationProgress;
    const { axis, travel, blur } = passedProps;
    if (presentationDirection === "entering") {
      const d = (1 - p) * travel;
      return { transform: axis === "x" ? `translateX(${d}px)` : `translateY(${d}px)`, filter: `blur(${(1 - p) * blur}px)`, opacity: Math.min(1, p * 1.6) };
    }
    const d = -p * travel * 0.6;
    return { transform: axis === "x" ? `translateX(${d}px)` : `translateY(${d}px)`, filter: `blur(${p * blur}px)`, opacity: 1 - p * 0.4 };
  }, [presentationDirection, presentationProgress, passedProps]);
  return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
};

export const cssLinearBlur = (): TransitionPresentation<P> => ({ component: Comp, props: { axis: "x", travel: 140, blur: 18 } });
export const cssBlurSlide = (): TransitionPresentation<P> => ({ component: Comp, props: { axis: "y", travel: 420, blur: 16 } });
