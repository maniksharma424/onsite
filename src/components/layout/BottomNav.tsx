'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, Users, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    href: '/',
    label: 'Projects',
    icon: Building2,
    matchPaths: ['/', '/project'],
  },
  {
    href: '/vendors',
    label: 'Vendors',
    icon: Users,
    matchPaths: ['/vendors', '/vendor'],
  },
  {
    href: '/payments',
    label: 'Payments',
    icon: Wallet,
    matchPaths: ['/payments'],
  },
];

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (item: (typeof navItems)[0]) => {
    return item.matchPaths.some((path) => 
      path === '/' ? pathname === '/' : pathname.startsWith(path)
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/80 backdrop-blur-lg safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200',
                active
                  ? 'text-zinc-900'
                  : 'text-zinc-400 hover:text-zinc-600'
              )}
            >
              <item.icon
                className={cn(
                  'w-5 h-5 transition-transform duration-200',
                  active && 'scale-110'
                )}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className={cn(
                  'text-xs transition-all duration-200',
                  active ? 'font-medium' : 'font-normal'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

