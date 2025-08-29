"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, UserPlus, Edit, Save } from "lucide-react"
import { customerAPI } from "@/lib/api"

interface Customer {
  user_id?: string
  ho_ten: string
  ten_dang_nhap: string
  mat_khau?: string
  so_dien_thoai: string
  email: string
  ngay_sinh: string
  gioi_tinh: string
  dia_chi: string
  ma_bao_hiem?: string
  status?: string
  ngay_dang_ky?: string
}

interface CustomerModalProps {
  isOpen: boolean
  onClose: () => void
  customer?: Customer | null
  onSave: () => void
  mode: "create" | "edit"
}

export function CustomerModal({ isOpen, onClose, customer, onSave, mode }: CustomerModalProps) {
  const [formData, setFormData] = useState<Customer>({
    ho_ten: "",
    ten_dang_nhap: "",
    mat_khau: "",
    so_dien_thoai: "",
    email: "",
    ngay_sinh: "",
    gioi_tinh: "",
    dia_chi: "",
    ma_bao_hiem: ""
  })
  
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (customer && mode === "edit") {
      setFormData({
        user_id: customer.user_id,
        ho_ten: customer.ho_ten || "",
        ten_dang_nhap: customer.ten_dang_nhap || "",
        so_dien_thoai: customer.so_dien_thoai || "",
        email: customer.email || "",
        ngay_sinh: customer.ngay_sinh?.split('T')[0] || "",
        gioi_tinh: customer.gioi_tinh || "",
        dia_chi: customer.dia_chi || "",
        ma_bao_hiem: customer.ma_bao_hiem || ""
      })
    } else {
      // Reset form for create mode
      setFormData({
        ho_ten: "",
        ten_dang_nhap: "",
        mat_khau: "",
        so_dien_thoai: "",
        email: "",
        ngay_sinh: "",
        gioi_tinh: "",
        dia_chi: "",
        ma_bao_hiem: ""
      })
    }
    setError("")
    setSuccess("")
  }, [customer, mode, isOpen])

  const handleInputChange = (field: keyof Customer, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError("") // Clear error when user types
  }

  const validateForm = () => {
    if (!formData.ho_ten.trim()) {
      setError("Tên là trường bắt buộc")
      return false
    }
    
    if (!formData.ten_dang_nhap.trim()) {
      setError("Tên đăng nhập là trường bắt buộc")
      return false
    }
    
    if (mode === "create" && (!formData.mat_khau || formData.mat_khau.length < 6)) {
      setError("Mật khẩu phải có ít nhất 6 ký tự")
      return false
    }
    
    if (!formData.so_dien_thoai.trim()) {
      setError("Số điện thoại là trường bắt buộc")
      return false
    }
    
    if (!formData.email.trim()) {
      setError("Email là trường bắt buộc")
      return false
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Email không hợp lệ")
      return false
    }
    
    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      if (mode === "create") {
        const response = await customerAPI.createCustomer({
          ho_ten: formData.ho_ten.trim(),
          ten_dang_nhap: formData.ten_dang_nhap.trim(),
          mat_khau: formData.mat_khau || "",
          so_dien_thoai: formData.so_dien_thoai.trim(),
          email: formData.email.trim(),
          ngay_sinh: formData.ngay_sinh,
          gioi_tinh: formData.gioi_tinh,
          dia_chi: formData.dia_chi.trim(),
          ma_bao_hiem: formData.ma_bao_hiem?.trim()
        })

        if (response.success) {
          setSuccess("Tạo bệnh nhân thành công!")
          setTimeout(() => {
            onSave()
            onClose()
          }, 1500)
        } else {
          setError(response.message || "Tạo bệnh nhân thất bại")
        }
      } else {
        // For edit mode, we would need an update customer API
        // Since we don't have customerAPI.updateCustomer, we'll show a placeholder
        setError("Chức năng cập nhật sẽ được triển khai sau khi có API updateCustomer")
      }
    } catch (error) {
      console.error("Save customer error:", error)
      setError("Lỗi mạng. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {mode === "create" ? (
                <>
                  <UserPlus className="h-5 w-5 text-blue-600" />
                  <span>Tạo Bệnh Nhân Mới</span>
                </>
              ) : (
                <>
                  <Edit className="h-5 w-5 text-green-600" />
                  <span>Chỉnh Sửa Thông Tin Bệnh Nhân</span>
                </>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tên */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="ho_ten">Họ và Tên *</Label>
              <Input
                id="ho_ten"
                value={formData.ho_ten}
                onChange={(e) => handleInputChange("ho_ten", e.target.value)}
                placeholder="Nhập họ và tên"
                required
              />
            </div>

            {/* Tên đăng nhập */}
            <div className="space-y-2">
              <Label htmlFor="ten_dang_nhap">Tên Đăng Nhập *</Label>
              <Input
                id="ten_dang_nhap"
                value={formData.ten_dang_nhap}
                onChange={(e) => handleInputChange("ten_dang_nhap", e.target.value)}
                placeholder="Nhập tên đăng nhập"
                disabled={mode === "edit"} // Don't allow changing username
                required
              />
            </div>

            {/* Mật khẩu (chỉ khi tạo mới) */}
            {mode === "create" && (
              <div className="space-y-2">
                <Label htmlFor="mat_khau">Mật Khẩu *</Label>
                <Input
                  id="mat_khau"
                  type="password"
                  value={formData.mat_khau}
                  onChange={(e) => handleInputChange("mat_khau", e.target.value)}
                  placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                  minLength={6}
                  required
                />
              </div>
            )}

            {/* Số điện thoại */}
            <div className="space-y-2">
              <Label htmlFor="so_dien_thoai">Số Điện Thoại *</Label>
              <Input
                id="so_dien_thoai"
                value={formData.so_dien_thoai}
                onChange={(e) => handleInputChange("so_dien_thoai", e.target.value)}
                placeholder="Nhập số điện thoại"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Nhập email"
                required
              />
            </div>

            {/* Ngày sinh */}
            <div className="space-y-2">
              <Label htmlFor="ngay_sinh">Ngày Sinh</Label>
              <Input
                id="ngay_sinh"
                type="date"
                value={formData.ngay_sinh}
                onChange={(e) => handleInputChange("ngay_sinh", e.target.value)}
              />
            </div>

            {/* Giới tính */}
            <div className="space-y-2">
              <Label htmlFor="gioi_tinh">Giới Tính</Label>
              <Select value={formData.gioi_tinh} onValueChange={(value) => handleInputChange("gioi_tinh", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nam">Nam</SelectItem>
                  <SelectItem value="Nữ">Nữ</SelectItem>
                  <SelectItem value="Khác">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Địa chỉ */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="dia_chi">Địa Chỉ</Label>
              <Input
                id="dia_chi"
                value={formData.dia_chi}
                onChange={(e) => handleInputChange("dia_chi", e.target.value)}
                placeholder="Nhập địa chỉ"
              />
            </div>

            {/* Mã bảo hiểm */}
            <div className="space-y-2">
              <Label htmlFor="ma_bao_hiem">Mã Bảo Hiểm</Label>
              <Input
                id="ma_bao_hiem"
                value={formData.ma_bao_hiem}
                onChange={(e) => handleInputChange("ma_bao_hiem", e.target.value)}
                placeholder="Nhập mã bảo hiểm (nếu có)"
              />
            </div>
          </div>

          {/* Messages */}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {mode === "create" ? "Đang tạo..." : "Đang lưu..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {mode === "create" ? "Tạo Bệnh Nhân" : "Lưu Thay Đổi"}
                </>
              )}
            </Button>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            <p>* Trường bắt buộc</p>
            {mode === "create" && (
              <p>Bệnh nhân sẽ có thể đăng nhập bằng tên đăng nhập và mật khẩu này.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}