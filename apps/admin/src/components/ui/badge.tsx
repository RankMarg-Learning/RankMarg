import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          " text-primary  ",
        secondary:
          "border-gray-500 text-gray-500  ",
        destructive:
          "border-destructive text-destructive  ",
        outline: "text-foreground",
        Easy: "border-green-500   text-green-500  ",
        Medium: "border-yellow-500  text-yellow-500  ",
        Hard: "border-red-500   text-red-500  ",
        1: "border-green-500   text-green-500  ",
        2: "border-yellow-500  text-yellow-500  ",
        3: "border-red-500   text-red-500  ",
        4: "border-purple-500   text-purple-500  ",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
