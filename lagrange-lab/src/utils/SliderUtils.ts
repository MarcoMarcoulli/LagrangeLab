const MIN_MASS_RATIO = 0.01;
const MAX_MASS_RATIO = 100;
export const SLIDER_MIN = 0;
export const SLIDER_MAX = 100;

export function sliderToMassRatio(sliderValue: number): number {
  const t = (sliderValue - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN);
  return MIN_MASS_RATIO * Math.pow(MAX_MASS_RATIO / MIN_MASS_RATIO, t);
}

export function massRatioToSlider(massRatio: number): number {
  return SLIDER_MIN + (SLIDER_MAX - SLIDER_MIN) *
    (Math.log(massRatio / MIN_MASS_RATIO) / Math.log(MAX_MASS_RATIO / MIN_MASS_RATIO));
}