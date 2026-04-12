"use client"

import { useState } from "react"

function IconWrapper({ children, href }: { children: React.ReactNode; href?: string }) {
  const Tag = href ? 'a' : 'span'
  return (
    <Tag
      {...(href ? { href, target: "_blank", rel: "noopener noreferrer" } : {})}
      className="inline-block cursor-pointer transition-all duration-300 ease-out hover:scale-[1.03] hover:-translate-y-[1px]"
      style={{ verticalAlign: "baseline" }}
    >
      {children}
    </Tag>
  )
}

export function LinkedInIcon() {
  const [hovered, setHovered] = useState(false)

  return (
    <IconWrapper href="https://www.linkedin.com/in/wwwwaaaaddddeeee/">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <path
          d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
          fill={hovered ? "var(--icon-hover)" : "var(--icon-default)"}
        />
      </svg>
    </IconWrapper>
  )
}

export function XIcon() {
  const [hovered, setHovered] = useState(false)

  return (
    <IconWrapper href="https://x.com/brianawade">
      <svg
        width="12"
        height="12"
        viewBox="0 0 640 640"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <path
          d="M453.2 112h70.6L369.6 288.2L551 528H409L297.7 382.6L170.5 528H99.8l164.9-188.5L90.8 112h145.6l100.5 132.9zm-24.8 373.8h39.1L215.1 152h-42z"
          fill={hovered ? "var(--icon-hover)" : "var(--icon-default)"}
        />
      </svg>
    </IconWrapper>
  )
}

export function GitHubIcon() {
  const [hovered, setHovered] = useState(false)

  return (
    <IconWrapper href="https://github.com/wwwwaaaaddddeeee">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <path
          d="M21 10.9549C21 9.11492 20.615 7.67992 19.83 6.57992C20.23 3.92492 19.49 2.53492 19.405 2.37992L19.14 1.91992L18.62 2.01492C18.53 2.02992 16.48 2.41992 14.695 4.10492C13.8 4.01492 12.875 4.00492 12.005 4.00492C11.135 4.00492 10.21 4.01992 9.31501 4.10492C7.53001 2.41992 5.48001 2.02992 5.39001 2.01492L4.87001 1.91992L4.60501 2.37992C4.51501 2.53492 3.78001 3.92492 4.18001 6.57992C3.39001 7.67992 3.01001 9.11992 3.01001 10.9549C3.01001 15.1949 5.85001 16.6849 8.46001 17.2099C8.18501 17.7199 8.03501 18.2949 8.01501 18.8899C7.79501 19.0449 7.42501 19.2499 7.01001 19.2499C6.39501 19.2499 6.02501 18.8299 5.46501 18.1499C4.86501 17.4149 4.11501 16.4999 2.76001 16.4999H2.01001V17.9999H2.76001C3.37501 17.9999 3.74501 18.4199 4.30501 19.0999C4.90501 19.8349 5.65501 20.7499 7.01001 20.7499C7.38001 20.7499 7.71501 20.6749 8.01001 20.5649V21.9999H9.51001V18.9949C9.51001 18.4099 9.73501 17.8649 10.135 17.4449C10.885 17.5049 11.545 17.5049 12.01 17.5049C12.475 17.5049 13.13 17.5049 13.885 17.4449C14.285 17.8649 14.51 18.4149 14.51 18.9949V21.9999H16.01V18.9949C16.01 18.3649 15.855 17.7549 15.56 17.2149C18.165 16.6899 21.01 15.1949 21.01 10.9599L21 10.9549ZM12 15.9999C6.74501 15.9999 4.50001 14.4899 4.50001 10.9549C4.50001 9.31992 4.84001 8.10492 5.54501 7.24992L5.76501 6.97992L5.70501 6.63992C5.45001 5.20992 5.58001 4.21492 5.72001 3.65492C6.39501 3.88492 7.52001 4.38992 8.50001 5.40492L8.76001 5.67492L9.13001 5.62992C10.055 5.51492 11.055 5.49992 12 5.49992C12.945 5.49992 13.945 5.51492 14.87 5.62992L15.24 5.67492L15.5 5.40492C16.47 4.39992 17.605 3.88992 18.28 3.65992C18.42 4.22492 18.55 5.21992 18.295 6.64492L18.235 6.98492L18.455 7.25492C19.155 8.10992 19.5 9.31992 19.5 10.9599C19.5 14.4949 17.255 16.0049 12 16.0049V15.9999Z"
          fill={hovered ? "var(--icon-hover)" : "var(--icon-default)"}
        />
      </svg>
    </IconWrapper>
  )
}

export function FigmaIcon() {
  const [hovered, setHovered] = useState(false)

  return (
    <IconWrapper href="https://www.figma.com/@brianawade">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <path
          d="M15 2.5C17.0692 2.5 18.75 4.18079 18.75 6.25C18.75 7.47567 18.1599 8.56451 17.249 9.24902C18.1604 9.93313 18.75 11.0227 18.75 12.25C18.75 14.3211 17.0711 16 15 16C14.1557 16 13.3768 15.7208 12.75 15.25V18.25C12.75 20.3192 11.0692 22 9 22C6.93079 22 5.25 20.3192 5.25 18.25C5.25 17.0244 5.83923 15.9345 6.75 15.25C5.83923 14.5655 5.25 13.4756 5.25 12.25C5.25 11.0244 5.83923 9.93452 6.75 9.25C5.83923 8.56548 5.25 7.4756 5.25 6.25C5.25 4.18079 6.93079 2.5 9 2.5H15ZM9 16C7.75921 16 6.75 17.0092 6.75 18.25C6.75 19.4908 7.75921 20.5 9 20.5C10.2408 20.5 11.25 19.4908 11.25 18.25V16H9ZM9 10C7.75921 10 6.75 11.0092 6.75 12.25C6.75 13.4908 7.75921 14.5 9 14.5H11.25V10H9ZM15 10C13.7574 10 12.75 11.0074 12.75 12.25C12.75 13.4926 13.7574 14.5 15 14.5C16.2426 14.5 17.25 13.4926 17.25 12.25C17.25 11.0074 16.2426 10 15 10ZM9 4C7.75921 4 6.75 5.00921 6.75 6.25C6.75 7.49079 7.75921 8.5 9 8.5H11.25V4H9ZM12.75 8.5H15C16.2408 8.5 17.25 7.49079 17.25 6.25C17.25 5.00921 16.2408 4 15 4H12.75V8.5Z"
          fill={hovered ? "var(--icon-hover)" : "var(--icon-default)"}
        />
      </svg>
    </IconWrapper>
  )
}

export function InstagramIcon() {
  const [hovered, setHovered] = useState(false)

  return (
    <IconWrapper href="https://www.instagram.com/brianawade/">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <path
          d="M16.25 3C18.8734 3 21 5.12665 21 7.75V16.25C21 18.8734 18.8734 21 16.25 21H8C5.37665 21 3.25 18.8734 3.25 16.25V7.75C3.25 5.12665 5.37665 3 8 3H16.25ZM8 4.5C6.20507 4.5 4.75 5.95507 4.75 7.75V16.25C4.75 18.0449 6.20507 19.5 8 19.5H16.25C18.0449 19.5 19.5 18.0449 19.5 16.25V7.75C19.5 5.95507 18.0449 4.5 16.25 4.5H8ZM12 7.25C14.6234 7.25 16.75 9.37665 16.75 12C16.75 14.6234 14.6234 16.75 12 16.75C9.37665 16.75 7.25 14.6234 7.25 12C7.25 9.37665 9.37665 7.25 12 7.25ZM12 8.75C10.2051 8.75 8.75 10.2051 8.75 12C8.75 13.7949 10.2051 15.25 12 15.25C13.7949 15.25 15.25 13.7949 15.25 12C15.25 10.2051 13.7949 8.75 12 8.75ZM17 6C17.5523 6 18 6.44772 18 7C18 7.55228 17.5523 8 17 8C16.4477 8 16 7.55228 16 7C16 6.44772 16.4477 6 17 6Z"
          fill={hovered ? "var(--icon-hover)" : "var(--icon-default)"}
        />
      </svg>
    </IconWrapper>
  )
}

export function SpotifyIcon() {
  const [hovered, setHovered] = useState(false)

  return (
    <IconWrapper href="https://open.spotify.com/user/brianawade">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <path
          d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 16.6944 7.30558 20.5 12 20.5C16.6944 20.5 20.5 16.6944 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM12 14C13.7473 14 15.4224 14.3388 16.9502 14.9541L16.3896 16.3457C15.0375 15.8011 13.5526 15.5 12 15.5C10.4479 15.5 8.96749 15.8006 7.60938 16.3457L7.05078 14.9541C8.58261 14.3393 10.2522 14 12 14ZM12 11C14.0957 11 16.098 11.3982 17.9375 12.1162L17.3926 13.5137C15.7222 12.8617 13.9042 12.5 12 12.5C10.0945 12.5 8.27747 12.8569 6.60938 13.5127L6.06055 12.1172C7.90243 11.393 9.90551 11 12 11ZM12 8C14.4382 8.00003 16.7752 8.45299 18.9258 9.28613L18.6543 9.98535L18.3838 10.6846C16.4047 9.91788 14.2515 9.50003 12 9.5C9.74959 9.50003 7.59533 9.92191 5.61426 10.6846L5.0752 9.28516C7.22393 8.45792 9.56065 8.00003 12 8Z"
          fill={hovered ? "var(--icon-hover)" : "var(--icon-default)"}
        />
      </svg>
    </IconWrapper>
  )
}

export function NpmIcon() {
  const [hovered, setHovered] = useState(false)

  return (
    <IconWrapper href="https://www.npmjs.com/~hellowade">
      <svg
        width="12"
        height="12"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <path
          d="M4.5 10.5v2h2v-2h8v-6H.5v6zm0 0v-6m4 0v6M6.5 6v3m-4-3v4.5m8-4.5v4.5m2-4.5v4.5"
          stroke={hovered ? "var(--icon-hover)" : "var(--icon-default)"}
        />
      </svg>
    </IconWrapper>
  )
}
