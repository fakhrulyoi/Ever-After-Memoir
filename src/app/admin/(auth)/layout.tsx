export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <div className="on-dark relative hidden overflow-hidden bg-olive-deep text-ivory lg:block">
        <div className="absolute inset-0 bg-[url('/brand/bride-salam.jpg')] bg-cover bg-center opacity-50" aria-hidden />
        <div className="relative flex h-full flex-col justify-end p-14">
          <p className="display text-6xl leading-none">Your day,<br /><em>as it felt.</em></p>
          <p className="mt-6 max-w-sm text-sm text-taupe">The private studio for Ever After Memoir — edit, preview and publish your website.</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </main>
  )
}
