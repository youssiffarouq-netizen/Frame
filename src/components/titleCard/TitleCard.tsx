import type { ReactNode } from "react";

interface TitleCardProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}

export function TitleCard({
  children,
  className = "",
  innerClassName = "",
}: TitleCardProps) {
  return (
    <section
      className={`border border-(--Border) bg-(--Card) p-1 shadow-[0_0_30px_0_var(--myShadow)] dark:border-(--dark-border) dark:bg-(--Dark-card) dark:shadow-[0_0_20px_0_var(--mydark-shadow)] ${className}`}
    >
      <div
        className={`border border-(--Border) p-3 sm:p-4 dark:border-(--dark-border) ${innerClassName}`}
      >
        {children}
      </div>
    </section>
  );
}

export default TitleCard;
