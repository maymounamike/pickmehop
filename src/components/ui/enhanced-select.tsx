import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const EnhancedSelect = SelectPrimitive.Root;

const EnhancedSelectGroup = SelectPrimitive.Group;

const EnhancedSelectValue = SelectPrimitive.Value;

const EnhancedSelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    loading?: boolean;
  }
>(({ className, children, loading, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-11 w-full items-center justify-between rounded-lg border border-input bg-background px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground transition-all duration-200 ease-in-out hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      loading && "cursor-wait",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      {loading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      ) : (
        <ChevronDown className="h-4 w-4 opacity-50 transition-transform duration-200 data-[state=open]:rotate-180" />
      )}
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
EnhancedSelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const EnhancedSelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1 sticky top-0 bg-popover z-10",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
EnhancedSelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const EnhancedSelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1 sticky bottom-0 bg-popover z-10",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
EnhancedSelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const EnhancedSelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
    maxHeight?: number;
  }
>(({ className, children, position = "popper", maxHeight = 300, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-[9999] min-w-[8rem] overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-xl",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        "will-change-transform",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      style={{ maxHeight }}
      position={position}
      {...props}
    >
      <EnhancedSelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <EnhancedSelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
EnhancedSelectContent.displayName = SelectPrimitive.Content.displayName;

const EnhancedSelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold text-muted-foreground", className)}
    {...props}
  />
));
EnhancedSelectLabel.displayName = SelectPrimitive.Label.displayName;

const EnhancedSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-md py-2.5 pl-8 pr-2 text-sm outline-none transition-colors duration-150 ease-in-out",
      "focus:bg-primary focus:text-primary-foreground hover:bg-primary/10 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "active:bg-primary/20 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4 text-primary" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
EnhancedSelectItem.displayName = SelectPrimitive.Item.displayName;

const EnhancedSelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
EnhancedSelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  EnhancedSelect,
  EnhancedSelectGroup,
  EnhancedSelectValue,
  EnhancedSelectTrigger,
  EnhancedSelectContent,
  EnhancedSelectLabel,
  EnhancedSelectItem,
  EnhancedSelectSeparator,
  EnhancedSelectScrollUpButton,
  EnhancedSelectScrollDownButton,
};