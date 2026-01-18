import * as React from "react"

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "destructive"
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(({ className, variant = "default", ...props }, ref) => {
    const variants = {
        default: "bg-white text-gray-950",
        destructive: "border-red-500/50 text-red-500 bg-red-50 [&>svg]:text-red-500",
    }
    return (
        <div
            ref={ref}
            role="alert"
            className={`relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 ${variants[variant]} ${className || ''}`}
            {...props}
        />
    )
})
Alert.displayName = "Alert"

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
    <div ref={ref} className={`text-sm [&_p]:leading-relaxed ${className || ''}`} {...props} />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertDescription }
