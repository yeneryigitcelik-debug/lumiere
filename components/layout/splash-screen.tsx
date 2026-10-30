"use client";

// The former full-screen splash blocked the first paint for ~3.6s and covered
// the page even when JavaScript was disabled. The brand identity is now shown
// directly in the hero, so this component renders nothing. The export stays
// so existing layout imports remain valid.
export function SplashScreen() {
  return null;
}
