"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/historico", label: "Histórico" },
  { href: "/configuracion", label: "Configuración" },
  { href: "/admin/preguntas", label: "Admin", matchPrefix: "/admin" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  function isActive(link: (typeof LINKS)[number]) {
    if (link.matchPrefix) return pathname.startsWith(link.matchPrefix);
    return pathname === link.href || pathname.startsWith(`${link.href}/`);
  }

  return (
    <header className="border-b border-border bg-background">
      <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-primary">
          QuizApp
        </Link>

        {/* Desktop links: visibles en sm+ */}
        <div className="hidden sm:flex items-center gap-4 text-sm">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors",
                isActive(link) ? "text-primary" : "hover:text-primary",
              )}
            >
              {link.label}
            </Link>
          ))}
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-muted hover:text-danger">
              Salir
            </button>
          </form>
        </div>

        {/* Hamburger: visible solo en móvil */}
        <button
          type="button"
          className="sm:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground hover:bg-primary-soft"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <Menu className="size-5" aria-hidden="true" />
          )}
        </button>
      </nav>

      {/* Drawer móvil */}
      {open ? (
        <div
          id="mobile-menu"
          className="sm:hidden border-t border-border bg-background"
        >
          <ul className="max-w-5xl mx-auto px-4 py-2 flex flex-col text-sm">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={close}
                  className={cn(
                    "block py-3 transition-colors",
                    isActive(link) ? "text-primary font-medium" : "hover:text-primary",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <form action="/api/auth/logout" method="POST" onSubmit={close}>
                <button
                  type="submit"
                  className="block w-full py-3 text-left text-muted hover:text-danger"
                >
                  Salir
                </button>
              </form>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}
