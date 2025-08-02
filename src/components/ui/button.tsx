import { cva, type VariantProps } from "class-variance-authority"
import { Slot as SlotPrimitive } from "radix-ui"
import * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-base font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive touch-manipulation",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:text-foreground hover:bg-background hover:border",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-12 px-6 py-3 has-[>svg]:px-5 min-w-[44px]",
        sm: "h-10 rounded-md gap-1.5 px-4 has-[>svg]:px-3 min-w-[44px]",
        lg: "h-14 rounded-md px-8 has-[>svg]:px-6 min-w-[48px]",
        square: "aspect-square p-3 min-w-[44px] min-h-[44px]"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? SlotPrimitive.Root : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
