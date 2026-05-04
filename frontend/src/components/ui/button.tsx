import * as React from 'react'

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

const variantClasses: Record<ButtonVariant, string> = {
  default: 'bg-slate-900 text-white hover:bg-slate-800',
  destructive: 'bg-red-500 text-white hover:bg-red-600',
  outline: 'border border-slate-200 bg-white hover:bg-slate-100 text-slate-900',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
  ghost: 'hover:bg-slate-100 text-slate-700',
  link: 'text-slate-900 underline-offset-4 hover:underline',
}

const sizeClasses: Record<ButtonSize, string> = {
  default: 'h-10 px-4 py-2 text-sm',
  sm: 'h-9 rounded-md px-3 text-xs',
  lg: 'h-11 rounded-md px-8',
  icon: 'h-10 w-10',
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
    const base = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50'
    return (
      <button
        ref={ref}
        className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
