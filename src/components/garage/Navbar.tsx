"use client";

import { Button } from "@/components/ui/button";
import { Car, LogOut, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/garage" className="flex items-center space-x-2">
              <Car className="h-8 w-8" />
              <span className="font-bold text-xl">Lugnut</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="text-sm">
                {session?.user?.name || session?.user?.email}
              </span>
              {session?.user?.hasActiveSubscription && (
                <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full">
                  Pro
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
