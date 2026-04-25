export default function Spinner({ size = 'md' }) {
  const sizes = { sm: 'size-4', md: 'size-6', lg: 'size-10' }
  return (
    <div
      className={`${sizes[size]} animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600`}
      role="status"
      aria-label="Cargando"
    />
  )
}
