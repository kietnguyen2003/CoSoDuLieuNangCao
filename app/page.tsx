"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Mock authentication logic
    const userRoles = {
      "customer@clinic.com": "customer",
      "receptionist@clinic.com": "receptionist",
      "doctor@clinic.com": "doctor",
      "accountant@clinic.com": "accountant",
      "manager@clinic.com": "manager",
      "executive@clinic.com": "executive",
    }

    const role = userRoles[email as keyof typeof userRoles]

    if (role && password === "password123") {
      // Store user info in localStorage (in real app, use proper auth)
      localStorage.setItem("userRole", role)
      localStorage.setItem("userEmail", email)
      router.push(`/${role}`)
    } else {
      setError("Invalid email or password")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Clinic Management System</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Login
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </form>

          <div className="mt-6 text-sm text-gray-600">
            <p className="font-semibold mb-2">Demo Accounts:</p>
            <div className="space-y-1 text-xs">
              <p>Customer: customer@clinic.com</p>
              <p>Receptionist: receptionist@clinic.com</p>
              <p>Doctor: doctor@clinic.com</p>
              <p>Accountant: accountant@clinic.com</p>
              <p>Manager: manager@clinic.com</p>
              <p>Executive: executive@clinic.com</p>
              <p className="mt-2">Password: password123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
