import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, email, fullName, role } = body

    if (!userId || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if user profile exists
    const { data: existingProfile } = await supabase.from("users").select("id").eq("id", userId).single()

    if (!existingProfile) {
      // Create user profile
      const { error: insertError } = await supabase.from("users").insert({
        id: userId,
        email: email,
        full_name: fullName || "User",
        role: role || "sales_rep",
      })

      if (insertError) {
        console.error("[v0] Error creating user profile:", insertError)
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Sync user error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
