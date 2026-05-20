import { HTMLAttributes } from 'react';

interface IconProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
  filled?: boolean;
}

export default function Icon({ name, filled, className = '', ...props }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined inline-flex items-center justify-center leading-none select-none ${className}`}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
      aria-hidden={props['aria-label'] ? undefined : true}
      {...props}
    >
      {name}
    </span>
  );
}
