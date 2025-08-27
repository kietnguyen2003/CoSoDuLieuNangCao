"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, Shield, Eye, EyeOff } from "lucide-react"
import { userAPI } from "@/lib/api"

export default function ChangePassword() {
  const [userRole, setUserRole] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const router = useRouter()

  // Password form state
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    const email = localStorage.getItem("userEmail")

    if (!role || role !== "customer") {
      router.push("/")
      return
    }

    setUserRole(role)
    setUserEmail(email || "")
  }, [router])

  const handleInputChange = (field: string, value: string) => {
    setPasswords(prev => ({ ...prev, [field]: value }))
    setErrorMessage("")
  }

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field as keyof typeof prev] }))
  }

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    }
  }

  const handleSave = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwords

    // Validate new password
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.isValid) {
      setErrorMessage("New password does not meet security requirements")
      return
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match")
      return
    }

    setIsLoading(true)
    setErrorMessage("")
    setSuccessMessage("")

    try {
      const response = await userAPI.changePassword({
        current_password: currentPassword,
        new_password: newPassword
      })

      if (response.success) {
        setSuccessMessage("Password changed successfully!")
        setPasswords({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        })
        setTimeout(() => setSuccessMessage(""), 5000)
      } else {
        setErrorMessage(response.message || "Failed to change password")
      }
    } catch (error) {
      console.error("Change password error:", error)
      setErrorMessage("Failed to change password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const goBack = () => {
    router.push("/customer")
  }

  const passwordValidation = validatePassword(passwords.newPassword)

  if (!userRole) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={userRole} userEmail={userEmail} />

      <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <Button onClick={goBack} variant="outline" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span>Change Password</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {successMessage && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
              </Alert>
            )}

            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwords.currentPassword}
                    onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                    placeholder="Enter your current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility("current")}
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwords.newPassword}
                    onChange={(e) => handleInputChange("newPassword", e.target.value)}
                    placeholder="Enter your new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility("new")}
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>

                {/* Password Requirements */}
                {passwords.newPassword && (
                  <div className="text-sm space-y-1">
                    <p className="font-medium text-gray-700">Password requirements:</p>
                    <ul className="space-y-1">
                      <li className={`flex items-center ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className="mr-2">{passwordValidation.minLength ? '✓' : '○'}</span>
                        At least 8 characters
                      </li>
                      <li className={`flex items-center ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className="mr-2">{passwordValidation.hasUpperCase ? '✓' : '○'}</span>
                        One uppercase letter
                      </li>
                      <li className={`flex items-center ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className="mr-2">{passwordValidation.hasLowerCase ? '✓' : '○'}</span>
                        One lowercase letter
                      </li>
                      <li className={`flex items-center ${passwordValidation.hasNumbers ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className="mr-2">{passwordValidation.hasNumbers ? '✓' : '○'}</span>
                        One number
                      </li>
                      <li className={`flex items-center ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className="mr-2">{passwordValidation.hasSpecialChar ? '✓' : '○'}</span>
                        One special character
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwords.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Confirm your new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility("confirm")}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
                {passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
                  <p className="text-sm text-red-600">Passwords do not match</p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-blue-800">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Security Tips</span>
              </div>
              <ul className="mt-2 text-sm text-blue-700 space-y-1">
                <li>• Use a unique password that you don't use elsewhere</li>
                <li>• Consider using a password manager</li>
                <li>• Never share your password with others</li>
                <li>• Change your password regularly</li>
              </ul>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleSave} 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLoading || !passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword || !passwordValidation.isValid || passwords.newPassword !== passwords.confirmPassword}
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}