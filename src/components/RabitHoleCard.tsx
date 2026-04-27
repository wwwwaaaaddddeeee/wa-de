export function RabitHoleCard() {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-xl">
      <picture>
        <source srcSet="/rabithole-dm.svg" media="(prefers-color-scheme: dark)" />
        <img
          src="/rabithole-lm.svg"
          alt="rabit hole"
          width={500}
          height={500}
          className="block h-full w-full"
        />
      </picture>
    </div>
  )
}
