"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authAPI } from "@/lib/api"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    ho_ten: "",
    ten_dang_nhap: "",
    mat_khau: "",
    confirmPassword: "",
    email: "",
    so_dien_thoai: "",
    role: "CUSTOMER"
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError("")
  }

  const validateForm = () => {
    if (!formData.ho_ten.trim()) {
      setError("Full name is required")
      return false
    }
    if (!formData.ten_dang_nhap.trim()) {
      setError("Username is required")
      return false
    }
    if (formData.mat_khau.length < 6) {
      setError("Password must be at least 6 characters long")
      return false
    }
    if (formData.mat_khau !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }
    if (formData.so_dien_thoai && !/^(0[3|5|7|8|9])+([0-9]{8})$/.test(formData.so_dien_thoai)) {
      setError("Please enter a valid Vietnamese phone number")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!validateForm()) return

    setIsLoading(true)
    try {
      const response = await authAPI.register({
        ho_ten: formData.ho_ten,
        ten_dang_nhap: formData.ten_dang_nhap,
        mat_khau: formData.mat_khau,
        email: formData.email || undefined,
        so_dien_thoai: formData.so_dien_thoai || undefined,
      })

      if (response.success) {
        setSuccess("Account created successfully! Please login with your credentials.")
        setTimeout(() => {
          router.push("/")
        }, 2000)
      } else {
        setError(response.message || "Registration failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
      console.error("Registration error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
          <p className="text-sm text-gray-600 mt-2">Join our clinic management system</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ho_ten">Full Name *</Label>
              <Input
                id="ho_ten"
                type="text"
                placeholder="Enter your full name"
                value={formData.ho_ten}
                onChange={(e) => handleChange("ho_ten", e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ten_dang_nhap">Username *</Label>
              <Input
                id="ten_dang_nhap"
                type="text"
                placeholder="Choose a username"
                value={formData.ten_dang_nhap}
                onChange={(e) => handleChange("ten_dang_nhap", e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email (optional)"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="so_dien_thoai">Phone Number</Label>
              <Input
                id="so_dien_thoai"
                type="tel"
                placeholder="Enter your phone number (optional)"
                value={formData.so_dien_thoai}
                onChange={(e) => handleChange("so_dien_thoai", e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Account Type</Label>
              <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="role-customer" value="CUSTOMER">Customer/Patient</SelectItem>
                  <SelectItem key="role-doctor" value="DOCTOR">Doctor</SelectItem>
                  <SelectItem key="role-receptionist" value="RECEPTIONIST">Receptionist</SelectItem>
                  <SelectItem key="role-accountant" value="ACCOUNTANT">Accountant</SelectItem>
                  <SelectItem key="role-clinic-manager" value="CLINIC_MANAGER">Clinic Manager</SelectItem>
                  <SelectItem key="role-operation-manager" value="OPERATION_MANAGER">Operation Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mat_khau">Password *</Label>
              <Input
                id="mat_khau"
                type="password"
                placeholder="Create a password (min 6 characters)"
                value={formData.mat_khau}
                onChange={(e) => handleChange("mat_khau", e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                required
                className="w-full"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700" 
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/" className="text-blue-600 hover:text-blue-500 font-medium">
                Sign in here
              </Link>
            </p>
          </div>

          <div className="mt-6 text-sm text-gray-600">
            <p className="font-semibold mb-2">Account Types:</p>
            <div className="space-y-1 text-xs">
              <p><strong>Customer:</strong> Book appointments, view medical records</p>
              <p><strong>Doctor:</strong> Manage patients, prescriptions, schedules</p>
              <p><strong>Receptionist:</strong> Manage appointments, patient check-in</p>
              <p><strong>Accountant:</strong> Handle billing and payments</p>
              <p><strong>Manager:</strong> Oversee clinic operations</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}