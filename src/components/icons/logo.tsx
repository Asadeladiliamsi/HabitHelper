
import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 512 512"
      {...props}
    >
      <path
        fill="#3949ab"
        d="M256 0L87.6 102.3 32.2 293.4l151 199.3h151.6l151-199.3L424.4 102.3z"
      />
      <path
        fill="#fff"
        d="M32.2 293.4L87.6 102.3 256 0v76.8l-83.8 51.5-30.2 92.4 90.6 122.4h-9.5zm447.6 0l-55.4-191.1L256 0v76.8l83.8 51.5 30.2 92.4-90.6 122.4h9.5z"
      />
      <path
        fill="#424242"
        d="M256 76.8l-83.8 51.5v.2l20.4 62.1c25-30.8 50.4-46.1 72.8-46.1s47.8 15.3 72.8 46.1l20.4-62.1v-.2z"
      />
      <path
        fill="none"
        stroke="#ff9800"
        strokeWidth="5"
        d="M192.6 244.7s22-44.6 63.4-44.6 63.4 44.6 63.4 44.6"
      />
      <path
        fill="#e53935"
        d="M172.4 344.1s28-17.9 83.6-17.9 83.6 17.9 83.6 17.9l-22.3 28.5s-28-17.9-61.3-17.9-61.3 17.9-61.3 17.9z"
      />
      <path
        fill="#ffeb3b"
        d="M150.1 372.6s28-17.9 105.9-17.9 105.9 17.9 105.9 17.9l-22.3 28.5c0-.1-47.2-17.9-83.6-17.9s-83.6 17.9-83.6 17.9z"
      />
      <path
        fill="#4caf50"
        d="M127.8 401.1s28-17.9 128.2-17.9 128.2 17.9 128.2 17.9l-22.3 28.5c0-.1-65.1-17.9-105.9-17.9s-105.9 17.9-105.9 17.9z"
      />
      <path fill="#212121" d="M256 298.5l-11.2 11.2 11.2 11.2 11.2-11.2z" />
      <path fill="#fff" d="M256 302.2l-3.7 3.7 3.7 3.8 3.7-3.8z" />
      <text
        x="256"
        y="313"
        fontSize="9"
        fill="#fff"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        1954
      </text>
      <path fill="#212121" d="M251 76.8h10v249h-10z" />
      <path
        fill="#fdd835"
        d="M256 38.4l14.8 45H318l-38.6 28 14.7 45-38.1-28-38.1 28 14.7-45-38.6-28h47.2z"
      />
      <path fill="#e53935" d="M154 446l-14 28.2h232l-14-28.2z" />
      <path fill="#fff" d="M140 446h232v28.2H140z" />
      <text
        x="256"
        y="466"
        fontSize="24"
        fill="#e53935"
        textAnchor="middle"
        fontFamily="sans-serif"
        fontWeight="bold"
      >
        SMP NEGERI 1 SAMPIT
      </text>
    </svg>
  );
}
