import { cn } from "@/lib/utils";

export function AppLogo({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={cn("inline-block", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="app-deriv-gradient"
          x1="0"
          y1="0"
          x2="120"
          y2="120"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#4f8fff" />
          <stop offset="100%" stopColor="#b165f1" />
        </linearGradient>
        <linearGradient
          id="app-deriv-gradient-2"
          x1="0"
          y1="0"
          x2="120"
          y2="120"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#44d7f0" />
          <stop offset="100%" stopColor="#9b63f6" />
        </linearGradient>
      </defs>
      <path d="M20 100L60 20L100 100H20Z" fill="url(#app-deriv-gradient)" opacity="0.96" />
      <path
        d="M40 88L60 42L80 82"
        stroke="white"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M40 80H64" stroke="white" strokeWidth="6" strokeLinecap="round" />
      <path d="M58 40L84 32" stroke="white" strokeWidth="5" strokeLinecap="round" />
      <circle cx="90" cy="30" r="5" fill="white" />
      <path
        d="M49 56H68"
        stroke="url(#app-deriv-gradient-2)"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M49 70H78"
        stroke="url(#app-deriv-gradient-2)"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M49 84H66"
        stroke="url(#app-deriv-gradient-2)"
        strokeWidth="12"
        strokeLinecap="round"
      />
    </svg>
  );
}
