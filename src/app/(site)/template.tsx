import { Curtain } from '@/components/site/Curtain'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Curtain />
      {children}
    </>
  )
}
