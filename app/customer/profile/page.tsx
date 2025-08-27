"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, User, Phone, MapPin, Calendar, Shield } from "lucide-react"
import { userAPI } from "@/lib/api"

export default function CustomerProfile() {
  const [userRole, setUserRole] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  // Profile form state - only fields that exist in database
  const [profile, setProfile] = useState({
    ho_ten: "",
    email: "",
    so_dien_thoai: "",
    ngay_sinh: "",
    gioi_tinh: "",
    dia_chi: "",
    ma_bao_hiem: "",
    ten_dang_nhap: ""
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
    
    // Load user profile data
    loadProfile()
  }, [router])

  const loadProfile = async () => {
    setIsLoading(true)
    try {
      const response = await userAPI.getProfile()
      if (response.success && response.data) {
        const userData = response.data
        setProfile({
          ho_ten: userData.ho_ten || "",
          email: userData.email || "",
          so_dien_thoai: userData.so_dien_thoai || "",
          ngay_sinh: userData.ngay_sinh ? userData.ngay_sinh.split('T')[0] : "",
          gioi_tinh: userData.gioi_tinh || "",
          dia_chi: userData.dia_chi || "",
          ma_bao_hiem: userData.ma_bao_hiem || "",
          ten_dang_nhap: userData.ten_dang_nhap || ""
        })
      } else {
        setError("Failed to load profile data")
      }
    } catch (error) {
      console.error("Failed to load profile:", error)
      setError("Failed to load profile data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError("")
    setSuccessMessage("")

    try {
      const response = await userAPI.updateProfile({
        ho_ten: profile.ho_ten,
        email: profile.email,
        so_dien_thoai: profile.so_dien_thoai,
        ngay_sinh: profile.ngay_sinh,
        gioi_tinh: profile.gioi_tinh,
        dia_chi: profile.dia_chi,
        ma_bao_hiem: profile.ma_bao_hiem
      })

      if (response.success) {
        setSuccessMessage("Profile updated successfully!")
        setTimeout(() => setSuccessMessage(""), 5000)
      } else {
        setError(response.message || "Failed to update profile")
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
      setError("Failed to update profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const goBack = () => {
    router.push("/customer")
  }

  if (!userRole) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={userRole} userEmail={userEmail} />

      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <Button onClick={goBack} variant="outline" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <span>Profile Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading && (
              <Alert>
                <AlertDescription>Loading profile data...</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Basic Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ho_ten">Full Name</Label>
                  <Input
                    id="ho_ten"
                    value={profile.ho_ten}
                    onChange={(e) => handleInputChange("ho_ten", e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ten_dang_nhap">Username</Label>
                  <Input
                    id="ten_dang_nhap"
                    value={profile.ten_dang_nhap}
                    onChange={(e) => handleInputChange("ten_dang_nhap", e.target.value)}
                    disabled={true} // Username shouldn't be editable
                    className="bg-gray-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="so_dien_thoai">Phone Number</Label>
                  <Input
                    id="so_dien_thoai"
                    value={profile.so_dien_thoai}
                    onChange={(e) => handleInputChange("so_dien_thoai", e.target.value)}
                    placeholder="e.g., 0901234567"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ngay_sinh">Date of Birth</Label>
                  <Input
                    id="ngay_sinh"
                    type="date"
                    value={profile.ngay_sinh}
                    onChange={(e) => handleInputChange("ngay_sinh", e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gioi_tinh">Gender</Label>
                  <Select value={profile.gioi_tinh} onValueChange={(value) => handleInputChange("gioi_tinh", value)} disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key="gender-nam" value="Nam">Nam</SelectItem>
                      <SelectItem key="gender-nu" value="Nữ">Nữ</SelectItem>
                      <SelectItem key="gender-khac" value="Khác">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dia_chi">Address</Label>
                <Input
                  id="dia_chi"
                  value={profile.dia_chi}
                  onChange={(e) => handleInputChange("dia_chi", e.target.value)}
                  placeholder="Enter your address"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ma_bao_hiem">Insurance Number</Label>
                <Input
                  id="ma_bao_hiem"
                  value={profile.ma_bao_hiem}
                  onChange={(e) => handleInputChange("ma_bao_hiem", e.target.value)}
                  placeholder="Enter your insurance number"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <Button 
                onClick={handleSave} 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLoading || isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}