"use client";

import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const NavigationMenu = React.forwardRef<React.ElementRef<typeof NavigationMenuPrimitive.Root>, React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>>(
  ({ className, children, ...props }, ref) => (
    <NavigationMenuPrimitive.Root ref={ref} className={cn("relative z-10 flex max-w-max flex-1 items-center justify-center", className)} {...props}>
      {children}
      <NavigationMenuViewport />
    </NavigationMenuPrimitive.Root>
  )
);
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

const NavigationMenuList = React.forwardRef<React.ElementRef<typeof NavigationMenuPrimitive.List>, React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>>(
  ({ className, ...props }, ref) => <NavigationMenuPrimitive.List ref={ref} className={cn("group flex list-none items-center space-x-2", className)} {...props} />
);
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;

const NavigationMenuItem = NavigationMenuPrimitive.Item;

const NavigationMenuTrigger = React.forwardRef<React.ElementRef<typeof NavigationMenuPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>>(
  ({ className, children, ...props }, ref) => (
    <NavigationMenuPrimitive.Trigger
      ref={ref}
      className={cn(
        "group inline-flex h-10 items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="ml-1 h-4 w-4 transition duration-200 group-data-[state=open]:rotate-180" aria-hidden="true" />
    </NavigationMenuPrimitive.Trigger>
  )
);
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

const NavigationMenuContent = React.forwardRef<React.ElementRef<typeof NavigationMenuPrimitive.Content>, React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>>(
  ({ className, ...props }, ref) => (
    <NavigationMenuPrimitive.Content
      ref={ref}
      className={cn(
        "left-0 top-0 w-full data-[motion=from-end]:animate-in data-[motion=from-start]:animate-in data-[motion=to-end]:animate-out data-[motion=to-start]:animate-out md:absolute md:w-auto",
        className
      )}
      {...props}
    />
  )
);
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;

const NavigationMenuLink = NavigationMenuPrimitive.Link;

const NavigationMenuViewport = React.forwardRef<React.ElementRef<typeof NavigationMenuPrimitive.Viewport>, React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>>(
  ({ className, ...props }, ref) => (
    <div className="absolute left-0 top-full flex w-full justify-center">
      <NavigationMenuPrimitive.Viewport
        className={cn(
          "origin-top-center relative mt-2 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-2xl border border-slate-100 bg-white text-slate-700 shadow-card data-[state=closed]:animate-out data-[state=open]:animate-in dark:border-slate-800 dark:bg-slate-900 md:w-[600px]",
          className
        )}
        ref={ref}
        {...props}
      />
    </div>
  )
);
NavigationMenuViewport.displayName = NavigationMenuPrimitive.Viewport.displayName;

const NavigationMenuIndicator = React.forwardRef<React.ElementRef<typeof NavigationMenuPrimitive.Indicator>, React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>>(
  ({ className, ...props }, ref) => (
    <NavigationMenuPrimitive.Indicator
      ref={ref}
      className={cn(
        "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out",
        className
      )}
      {...props}
    >
      <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-white shadow-md dark:bg-slate-900" />
    </NavigationMenuPrimitive.Indicator>
  )
);
NavigationMenuIndicator.displayName = NavigationMenuPrimitive.Indicator.displayName;

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport
};
