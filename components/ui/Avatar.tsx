"use client";

interface AvatarProps {
  initials: string;
  color?: string;
  size?: number;
}

export function Avatar({ initials, color = "#00BFA6", size = 34 }: AvatarProps) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: size / 3,
      background: `linear-gradient(135deg, ${color}44, ${color}22)`,
      border: `1.5px solid ${color}44`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Georgia, serif",
      fontWeight: 700,
      fontSize: size * 0.36,
      color,
      flexShrink: 0,
      userSelect: "none",
    }}>
      {initials}
    </div>
  );
}
