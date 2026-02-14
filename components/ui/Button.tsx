import React from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
   variant?: ButtonVariant | (string & {});
   size?: ButtonSize | (string & {});
   fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
   ({ className = "", variant = "primary", size = "md", fullWidth, children, ...props }, ref) => {
      const classes = ["btn", `btn--${variant}`, `btn--${size}`, fullWidth ? "btn--full" : "", className].filter(Boolean).join(" ");

      return (
         <button ref={ref} className={classes} {...props}>
            {children}
         </button>
      );
   },
);

Button.displayName = "Button";

export default Button;
