// Malay pages: set the document language before the page is painted
export default function MalayLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: "document.documentElement.lang='ms'" }} />
      {children}
    </>
  )
}
