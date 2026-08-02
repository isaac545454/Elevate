type StatusMessageProps = {
  children: string
  variant?: 'loading' | 'error'
}

export function StatusMessage({
  children,
  variant = 'loading',
}: StatusMessageProps) {
  return (
    <p className={`status status--${variant}`} role="status">
      {children}
    </p>
  )
}
