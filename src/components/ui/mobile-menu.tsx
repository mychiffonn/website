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
        <Button variant="ghost" size="square" className="sm:hidden" title="Menu">
          <svg
            className="size-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
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
