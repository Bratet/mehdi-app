"use client"

import { use } from "react"
import MobileShell from "@/components/layout/MobileShell"
import SessionDetail from "@/components/sessions/SessionDetail"

export default function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <MobileShell>
      <SessionDetail sessionId={parseInt(id)} />
    </MobileShell>
  )
}
