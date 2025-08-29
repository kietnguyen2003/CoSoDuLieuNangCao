"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authAPI } from "@/lib/api"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await authAPI.login({
        ten_dang_nhap: email,
        mat_khau: password,
      })

      if (response.success && response.data) {
        // Store authentication data
        localStorage.setItem("authToken", response.data.token)
        localStorage.setItem("userRole", response.data.user.role.toLowerCase())
        localStorage.setItem("userEmail", response.data.user.email || email)
        localStorage.setItem("userId", response.data.user.ma_user)
        
        // Navigate to appropriate dashboard
        const roleMap: Record<string, string> = {
          "CUSTOMER": "customer",
          "DOCTOR": "doctor", 
          "RECEPTIONIST": "receptionist",
          "ACCOUNTANT": "accountant",
          "CLINIC_MANAGER": "manager",
          "OPERATION_MANAGER": "executive"
        }
        
        const dashboardRoute = roleMap[response.data.user.role] || "customer"
        router.push(`/${dashboardRoute}`)
      } else {
        setError(response.message || "Invalid email or password")
      }
    } catch (error) {
      setError("Network error. Please try again.")
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
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
              <Label htmlFor="email">Username</Label>
              <Input
                id="email"
                placeholder="Enter your username"
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

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Dont have an account?{" "}
              <Link href="/register" className="text-blue-600 hover:text-blue-500 font-medium">
                Create account
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              <Link href="/forgot-password" className="text-blue-600 hover:text-blue-500 font-medium">
                Forgot your password?
              </Link>
            </p>
          </div>

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
