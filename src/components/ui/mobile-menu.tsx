import { Menu } from "lucide-react"
import { useEffect, useState } from "react"

import { NAV_LINKS } from "@/config"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentPath, setCurrentPath] = useState("")

  useEffect(() => {
    // Set initial pathname
    setCurrentPath(window.location.pathname)

    const handleViewTransitionStart = () => {
      setIsOpen(false)
    }

    const handleNavigationComplete = () => {
      setCurrentPath(window.location.pathname)
    }

    document.addEventListener("astro:before-swap", handleViewTransitionStart)
    document.addEventListener("astro:after-swap", handleNavigationComplete)

    return () => {
      document.removeEventListener("astro:before-swap", handleViewTransitionStart)
      document.removeEventListener("astro:after-swap", handleNavigationComplete)
    }
  }, [])

  return (
    <DropdownMenu open={isOpen} onOpenChange={(val) => setIsOpen(val)}>
      <DropdownMenuTrigger
        asChild
        onClick={() => {
          setIsOpen((val) => !val)
        }}
      >
        <Button variant="ghost" className="size-8 sm:hidden" title="Menu">
          <Menu className="size-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background">
        {NAV_LINKS.map((item) => {
          const isActive =
            currentPath === item.href || (item.href !== "/" && currentPath.startsWith(item.href))

          return (
            <DropdownMenuItem key={item.href} asChild>
              <a
                href={item.href}
                className={`w-full text-lg font-medium capitalize ${
                  isActive ? "text-foreground bg-accent/20" : "text-foreground/80"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default MobileMenu
