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
          d="M20.5 2H3.5C3.10218 2 2.72064 2.15804 2.43934 2.43934C2.15804 2.72064 2 3.10218 2 3.5V20.5C2 20.8978 2.15804 21.2794 2.43934 21.5607C2.72064 21.842 3.10218 22 3.5 22H20.5C20.8978 22 21.2794 21.842 21.5607 21.5607C21.842 21.2794 22 20.8978 22 20.5V3.5C22 3.10218 21.842 2.72064 21.5607 2.43934C21.2794 2.15804 20.8978 2 20.5 2ZM8 19H5V10H8V19ZM6.5 8.25C6.15618 8.24017 5.82288 8.12924 5.54175 7.93108C5.26062 7.73291 5.04411 7.45629 4.9193 7.13578C4.79448 6.81527 4.76687 6.46508 4.83994 6.12897C4.913 5.79286 5.0835 5.48574 5.33011 5.24597C5.57673 5.00621 5.88853 4.84443 6.22656 4.78086C6.5646 4.71729 6.91387 4.75475 7.23074 4.88854C7.5476 5.02234 7.81802 5.24655 8.00819 5.53315C8.19836 5.81975 8.29986 6.15604 8.3 6.5C8.2921 6.97035 8.09834 7.41845 7.76105 7.74637C7.42376 8.07428 6.97039 8.25535 6.5 8.25ZM19 19H16V14.26C16 12.84 15.4 12.33 14.62 12.33C14.3913 12.3452 14.1679 12.4055 13.9625 12.5073C13.7572 12.6091 13.574 12.7505 13.4235 12.9234C13.273 13.0962 13.1581 13.2971 13.0854 13.5144C13.0127 13.7318 12.9837 13.9614 13 14.19C12.995 14.2365 12.995 14.2835 13 14.33V19H10V10H12.9V11.3C13.1925 10.855 13.5944 10.4926 14.0672 10.2474C14.54 10.0023 15.0677 9.88267 15.6 9.9C17.15 9.9 18.96 10.76 18.96 13.56L19 19Z"
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
          d="M12 2.25C6.475 2.25 2 6.7275 2 12.25C2 16.6692 4.865 20.4167 8.8375 21.7375C9.3375 21.8317 9.52083 21.5225 9.52083 21.2567C9.52083 21.0192 9.5125 20.39 9.50833 19.5567C6.72667 20.16 6.14 18.215 6.14 18.215C5.685 17.0608 5.0275 16.7525 5.0275 16.7525C4.12167 16.1325 5.0975 16.145 5.0975 16.145C6.10167 16.215 6.62917 17.175 6.62917 17.175C7.52083 18.7042 8.97 18.2625 9.54167 18.0067C9.63167 17.36 9.88917 16.9192 10.175 16.6692C7.95417 16.4192 5.62 15.5592 5.62 11.7275C5.62 10.6358 6.0075 9.74417 6.64917 9.04417C6.53667 8.79167 6.19917 7.775 6.73667 6.3975C6.73667 6.3975 7.57417 6.12917 9.48667 7.4225C10.2867 7.2 11.1367 7.09 11.9867 7.085C12.8367 7.09 13.6867 7.2 14.4867 7.4225C16.3867 6.12917 17.2242 6.3975 17.2242 6.3975C17.7617 7.775 17.4242 8.79167 17.3242 9.04417C17.9617 9.74417 18.3492 10.6358 18.3492 11.7275C18.3492 15.5692 16.0117 16.415 13.7867 16.6608C14.1367 16.9608 14.4617 17.5742 14.4617 18.5108C14.4617 19.8492 14.4492 20.9242 14.4492 21.2492C14.4492 21.5117 14.6242 21.8242 15.1367 21.7242C19.1375 20.4125 22 16.6625 22 12.25C22 6.7275 17.5225 2.25 12 2.25Z"
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
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.5927 3.5C18.5739 3.5 20.9995 5.92513 20.9995 8.90682V16.0932C20.9995 19.0744 18.5739 21.5 15.5927 21.5H8.40631C5.42462 21.5 3 19.0744 3 16.0932V8.90682C3 5.92513 5.42462 3.5 8.40631 3.5H15.5927ZM15.5927 5.19357H8.40631C6.35866 5.19357 4.69306 6.85917 4.69306 8.90682V16.0932C4.69306 18.1408 6.35866 19.8064 8.40631 19.8064H15.5927C17.6403 19.8064 19.3064 18.1408 19.3064 16.0932V8.90682C19.3064 6.85917 17.6403 5.19357 15.5927 5.19357ZM12.0738 8.0669C14.5177 8.0669 16.5064 10.0555 16.5064 12.5C16.5064 14.944 14.5177 16.9326 12.0738 16.9326C9.6293 16.9326 7.64067 14.944 7.64067 12.5C7.64067 10.0555 9.6293 8.0669 12.0738 8.0669ZM12.0738 9.66025C10.5079 9.66025 9.23402 10.9341 9.23402 12.5C9.23402 14.0654 10.5079 15.3392 12.0738 15.3392C13.6391 15.3392 14.913 14.0654 14.913 12.5C14.913 10.9341 13.6391 9.66025 12.0738 9.66025ZM16.7653 6.71367C17.3478 6.71367 17.8204 7.18628 17.8204 7.76878C17.8204 8.35179 17.3478 8.8244 16.7653 8.8244C16.1823 8.8244 15.7097 8.35179 15.7097 7.76878C15.7097 7.18628 16.1823 6.71367 16.7653 6.71367Z"
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
