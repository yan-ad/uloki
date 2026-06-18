import type { SVGProps } from 'react'

type SVGIconProps = SVGProps<SVGSVGElement>

export const Icons = {
  logo: (props: SVGIconProps) => (
    <svg
      fill="none"
      viewBox="0 0 256 256"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>uloki Logo</title>
      {/* Snake body */}
      <path
        d="M48 128c0-20 40-30 80-40s80-10 80 30-40 40-80 40-80 10-80 30 40 30 80 20 80-30 80-30"
        stroke="#22c55e"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
      />
      {/* Head */}
      <ellipse cx="48" cy="128" rx="14" ry="10" fill="#16a34a" />
      {/* Eyes */}
      <circle cx="42" cy="126" r="2.5" fill="#fff" />
      <circle cx="42" cy="130" r="2.5" fill="#fff" />
    </svg>
  ),
}
