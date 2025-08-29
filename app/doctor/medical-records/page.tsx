"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, FileText, User, Calendar, Plus, Edit } from "lucide-react"
import { medicalRecordAPI, appointmentAPI, type MedicalRecord } from "@/lib/api"

export default function MedicalRecords() {
  const [userRole, setUserRole] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()

  // Form state - using database field names
  const [recordForm, setRecordForm] = useState({
    ma_customer: "",
    ten_khach_hang: "",
    ngay_kham: new Date().toISOString().split('T')[0],
    ly_do_kham: "",
    trieu_chung: "",
    chan_doan: "",
    ma_icd10: "",
    huong_dan_dieu_tri: "",
    ghi_chu: "",
    ngay_tai_kham: ""
  })


  const commonDiagnoses = [
    { code: "J06.9", name: "Upper Respiratory Tract Infection" },
    { code: "E11.9", name: "Type 2 Diabetes Mellitus" },
    { code: "I10", name: "Essential Hypertension" },
    { code: "M79.3", name: "Panniculitis" },
    { code: "K21.9", name: "Gastro-oesophageal reflux disease" }
  ]

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    const email = localStorage.getItem("userEmail")

    if (!role || role !== "doctor") {
      router.push("/")
      return
    }

    setUserRole(role)
    setUserEmail(email || "")
    
    // Load initial data
    loadMedicalRecords()
    loadPatients()
    
    // Check URL params for specific record
    const recordParam = searchParams.get('record')
    if (recordParam) {
      loadSpecificRecord(recordParam)
    }
  }, [router, searchParams])

  const loadMedicalRecords = async () => {
    setIsLoading(true)
    try {
      const response = await medicalRecordAPI.getMedicalRecords()
      if (response.success && response.data) {
        setRecords(response.data)
      } else {
        setError("Failed to load medical records")
      }
    } catch (error) {
      console.error("Failed to load medical records:", error)
      setError("Failed to load medical records")
    } finally {
      setIsLoading(false)
    }
  }

  const loadPatients = async () => {
    try {
      // Get patients from recent appointments
      const response = await appointmentAPI.getAppointments()
      if (response.success && response.data) {
        // Extract unique customers from appointments
        const uniquePatients = response.data
          .filter(apt => apt.ten_khach_hang)
          .reduce((acc: any[], apt) => {
            const exists = acc.find(p => p.ma_customer === apt.ma_customer)
            if (!exists) {
              acc.push({
                ma_customer: apt.ma_customer,
                ten_khach_hang: apt.ten_khach_hang
              })
            }
            return acc
          }, [])
        setPatients(uniquePatients)
      }
    } catch (error) {
      console.error("Failed to load patients:", error)
    }
  }

  const loadSpecificRecord = async (recordId: string) => {
    try {
      const response = await medicalRecordAPI.getMedicalRecord(recordId)
      if (response.success && response.data) {
        setSelectedRecord(response.data)
        setIsEditing(true)
        // Fill form with record data
        setRecordForm({
          ma_customer: response.data.ma_customer || "",
          ten_khach_hang: response.data.ten_khach_hang || "",
          ngay_kham: response.data.ngay_kham ? response.data.ngay_kham.split('T')[0] : "",
          ly_do_kham: response.data.ly_do_kham || "",
          trieu_chung: response.data.trieu_chung || "",
          chan_doan: response.data.chan_doan || "",
          ma_icd10: response.data.ma_icd10 || "",
          huong_dan_dieu_tri: response.data.huong_dan_dieu_tri || "",
          ghi_chu: response.data.ghi_chu || "",
          ngay_tai_kham: response.data.ngay_tai_kham ? response.data.ngay_tai_kham.split('T')[0] : ""
        })
      } else {
        setError(`Cannot find medical record: ${recordId}`)
      }
    } catch (error) {
      console.error("Failed to load specific record:", error)
      setError(`Failed to load record: ${recordId}`)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setRecordForm(prev => ({ ...prev, [field]: value }))
  }

  const handlePatientSelect = (patientId: string) => {
    const patient = patients.find(p => p.ma_customer === patientId)
    if (patient) {
      setRecordForm(prev => ({
        ...prev,
        ma_customer: patient.ma_customer,
        ten_khach_hang: patient.ten_khach_hang
      }))
    }
  }

  const handleDiagnosisSelect = (diagnosisValue: string) => {
    const diagnosis = commonDiagnoses.find(d => d.code === diagnosisValue)
    if (diagnosis) {
      setRecordForm(prev => ({
        ...prev,
        chan_doan: diagnosis.name,
        ma_icd10: diagnosis.code
      }))
    }
  }

  const handleSave = async (type = "finalized") => {
    if (!recordForm.ma_customer || !recordForm.trieu_chung || !recordForm.chan_doan) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc: Bệnh nhân, Triệu chứng, và Chẩn đoán")
      return
    }

    setIsSaving(true)
    setError("")

    try {
      const recordData = {
        ma_customer: recordForm.ma_customer,
        ma_bac_si: localStorage.getItem("userId") || "",
        ma_phong_kham: "PK001", // Default clinic - should be dynamic
        ngay_kham: recordForm.ngay_kham,
        trieu_chung: recordForm.trieu_chung,
        chan_doan: recordForm.chan_doan,
        huong_dan_dieu_tri: recordForm.huong_dan_dieu_tri,
        ma_icd10: recordForm.ma_icd10,
        ngay_tai_kham: recordForm.ngay_tai_kham || undefined
      }

      let response
      if (selectedRecord) {
        response = await medicalRecordAPI.updateMedicalRecord(selectedRecord.ma_ho_so, recordData)
      } else {
        response = await medicalRecordAPI.createMedicalRecord(recordData)
      }

      if (response.success) {
        setSuccessMessage(`Medical record ${selectedRecord ? "updated" : "created"} successfully!`)
        setIsEditing(false)
        setSelectedRecord(null)
        resetForm()
        await loadMedicalRecords() // Reload the list
        setTimeout(() => setSuccessMessage(""), 5000)
      } else {
        setError(response.message || "Failed to save medical record")
      }
    } catch (error) {
      console.error("Save medical record error:", error)
      setError("Failed to save medical record. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const resetForm = () => {
    setRecordForm({
      ma_customer: "",
      ten_khach_hang: "",
      ngay_kham: new Date().toISOString().split('T')[0],
      ly_do_kham: "",
      trieu_chung: "",
      chan_doan: "",
      ma_icd10: "",
      huong_dan_dieu_tri: "",
      ghi_chu: "",
      ngay_tai_kham: ""
    })
  }

  const handleEditRecord = (record: MedicalRecord) => {
    setSelectedRecord(record)
    const recordDate = record.ngay_kham ? new Date(record.ngay_kham).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    const followUpDate = record.ngay_tai_kham ? new Date(record.ngay_tai_kham).toISOString().split('T')[0] : ""
    
    setRecordForm({
      ma_customer: record.ma_customer || "",
      ten_khach_hang: record.ten_khach_hang || "",
      ngay_kham: recordDate,
      ly_do_kham: record.ly_do_kham || "",
      trieu_chung: record.trieu_chung || "",
      chan_doan: record.chan_doan || "",
      ma_icd10: record.ma_icd10 || "",
      huong_dan_dieu_tri: record.huong_dan_dieu_tri || "",
      ghi_chu: record.ghi_chu || "",
      ngay_tai_kham: followUpDate
    })
    setIsEditing(true)
  }

  const handleNewRecord = () => {
    setSelectedRecord(null)
    resetForm()
    setIsEditing(true)
  }

  const goBack = () => {
    router.push("/doctor")
  }

  if (!userRole) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={userRole} userEmail={userEmail} />

      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <Button onClick={goBack} variant="outline" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {successMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Records List */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Medical Records</span>
                </div>
                <Button onClick={handleNewRecord} size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Record
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <p>Loading medical records...</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {records.length > 0 ? (
                    records.map((record) => {
                      const recordDate = record.ngay_kham ? new Date(record.ngay_kham).toLocaleDateString() : ""
                      
                      return (
                        <Card key={record.ma_ho_so} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-medium">{record.ten_khach_hang || "Unknown Patient"}</div>
                                <div className="text-sm text-gray-600">Customer ID: {record.ma_customer}</div>
                                <div className="text-sm text-gray-600">Record ID: {record.ma_ho_so}</div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="outline" onClick={() => handleEditRecord(record)}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-3 w-3 text-gray-500" />
                                <span>{recordDate}</span>
                              </div>
                              {record.trieu_chung && <p><strong>Symptoms:</strong> {record.trieu_chung}</p>}
                              {record.chan_doan && (
                                <p><strong>Diagnosis:</strong> {record.chan_doan} {record.ma_icd10 && `(${record.ma_icd10})`}</p>
                              )}
                              {record.huong_dan_dieu_tri && (
                                <p><strong>Treatment:</strong> {record.huong_dan_dieu_tri}</p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No medical records found
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Record Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-green-600" />
                <span>{selectedRecord ? "Edit Medical Record" : "Create Medical Record"}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <>
                  {/* Patient Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 relative">
                      <Label htmlFor="patientId">Bệnh nhân</Label>
                      <Select value={recordForm.ma_customer} onValueChange={handlePatientSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn bệnh nhân" />
                        </SelectTrigger>
                        <SelectContent className="z-50">
                          {patients.map((patient) => (
                            <SelectItem key={patient.ma_customer} value={patient.ma_customer}>
                              {patient.ten_khach_hang}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">Ngày khám</Label>
                      <Input
                        id="date"
                        type="date"
                        value={recordForm.ngay_kham}
                        onChange={(e) => handleInputChange("ngay_kham", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Chief Complaint */}
                  <div className="space-y-2">
                    <Label htmlFor="chiefComplaint">Lý do khám</Label>
                    <Input
                      id="chiefComplaint"
                      value={recordForm.ly_do_kham}
                      onChange={(e) => handleInputChange("ly_do_kham", e.target.value)}
                      placeholder="Lý do chính khiến bệnh nhân đến khám..."
                    />
                  </div>

                  {/* Symptoms */}
                  <div className="space-y-2">
                    <Label htmlFor="symptoms">Triệu chứng & Tiền sử</Label>
                    <textarea
                      id="symptoms"
                      className="w-full p-2 border rounded-md"
                      rows={3}
                      value={recordForm.trieu_chung}
                      onChange={(e) => handleInputChange("trieu_chung", e.target.value)}
                      placeholder="Mô tả chi tiết triệu chứng và tiền sử bệnh của bệnh nhân..."
                    />
                  </div>

                  {/* Diagnosis */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 relative">
                      <Label htmlFor="diagnosis">Chẩn đoán</Label>
                      <Select value={recordForm.ma_icd10} onValueChange={handleDiagnosisSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn chẩn đoán" />
                        </SelectTrigger>
                        <SelectContent className="z-50 max-h-60">
                          {commonDiagnoses.map((diagnosis) => (
                            <SelectItem key={diagnosis.code} value={diagnosis.code}>
                              {diagnosis.name} ({diagnosis.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="icdCode">Mã ICD-10</Label>
                      <Input
                        id="icdCode"
                        value={recordForm.ma_icd10}
                        onChange={(e) => handleInputChange("ma_icd10", e.target.value)}
                        placeholder="Mã ICD-10"
                      />
                    </div>
                  </div>

                  {/* Custom Diagnosis */}
                  <div className="space-y-2">
                    <Label htmlFor="customDiagnosis">Chẩn đoán tự nhập (nếu không có trong danh sách)</Label>
                    <Input
                      id="customDiagnosis"
                      value={recordForm.chan_doan}
                      onChange={(e) => handleInputChange("chan_doan", e.target.value)}
                      placeholder="Nhập chẩn đoán chi tiết..."
                    />
                  </div>

                  {/* Prescription */}
                  <div className="space-y-2">
                    <Label htmlFor="prescription">Hướng dẫn điều trị</Label>
                    <textarea
                      id="prescription"
                      className="w-full p-2 border rounded-md"
                      rows={3}
                      value={recordForm.huong_dan_dieu_tri}
                      onChange={(e) => handleInputChange("huong_dan_dieu_tri", e.target.value)}
                      placeholder="Hướng dẫn điều trị, thuốc và liều lượng sử dụng..."
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Ghi chú lâm sàng</Label>
                    <textarea
                      id="notes"
                      className="w-full p-2 border rounded-md"
                      rows={3}
                      value={recordForm.ghi_chu}
                      onChange={(e) => handleInputChange("ghi_chu", e.target.value)}
                      placeholder="Các ghi chú bổ sung về quá trình khám..."
                    />
                  </div>

                  {/* Follow-up */}
                  <div className="space-y-2">
                    <Label htmlFor="followUp">Ngày tái khám</Label>
                    <Input
                      id="followUp"
                      type="date"
                      value={recordForm.ngay_tai_kham}
                      onChange={(e) => handleInputChange("ngay_tai_kham", e.target.value)}
                      placeholder="Chọn ngày tái khám..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 justify-end pt-4">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => handleSave("draft")} variant="outline">
                      Save as Draft
                    </Button>
                    <Button 
                      onClick={() => handleSave("finalized")} 
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={!recordForm.ma_customer || !recordForm.trieu_chung || !recordForm.chan_doan || isSaving}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? "Đang lưu..." : "Finalize Record"}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Select a record to edit or create a new medical record</p>
                  <Button onClick={handleNewRecord} className="mt-4 bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Record
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}