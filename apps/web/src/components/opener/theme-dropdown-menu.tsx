"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { THEME, useTheme } from "@repo/ui/hooks/use-theme";

export function Trigger({
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuTrigger>) {
  const { theme } = useTheme();

  const currentTheme = THEME[theme];

  return (
    <DropdownMenuTrigger {...props}>
      <currentTheme.icon />
      {currentTheme.name}
      {children}
    </DropdownMenuTrigger>
  );
}

interface Props
  extends
    Omit<React.ComponentProps<typeof DropdownMenu>, "children">,
    Pick<
      React.ComponentProps<typeof DropdownMenuContent>,
      "side" | "align" | "sideOffset" | "alignOffset"
    > {
  children: React.ReactNode;
}

export function Root({
  children,
  side,
  sideOffset,
  align,
  alignOffset,
  ...props
}: Props) {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu {...props}>
      {children}

      <DropdownMenuContent
        className="min-w-56"
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
      >
        <DropdownMenuGroup>
          {Object.values(THEME).map((t) => (
            <DropdownMenuItem
              key={t.id}
              onClick={() => setTheme(t.id)}
              aria-label={`Select ${t.name} Mode`}
            >
              <t.icon /> {t.name}
              {theme === t.id && (
                <DropdownMenuLabel>Selected</DropdownMenuLabel>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
