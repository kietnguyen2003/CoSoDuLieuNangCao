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

  // Form state - using database field names
  const [recordForm, setRecordForm] = useState({
    ma_customer: "",
    ten_khach_hang: "",
    ngay_kham: new Date().toISOString().split('T')[0],
    trieu_chung: "",
    chan_doan: "",
    ma_icd10: "",
    huong_dan_dieu_tri: "",
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
  }, [router])

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

  const handleSave = async () => {
    if (!recordForm.ma_customer || !recordForm.trieu_chung || !recordForm.chan_doan) {
      setError("Please fill in required fields: Patient, Symptoms, and Diagnosis")
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
      trieu_chung: "",
      chan_doan: "",
      ma_icd10: "",
      huong_dan_dieu_tri: "",
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
      trieu_chung: record.trieu_chung || "",
      chan_doan: record.chan_doan || "",
      ma_icd10: record.ma_icd10 || "",
      huong_dan_dieu_tri: record.huong_dan_dieu_tri || "",
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
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  {/* Patient Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="patientId">Patient</Label>
                      <Select value={recordForm.patientId} onValueChange={handlePatientSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select patient" />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.name} (ID: {patient.id})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={recordForm.date}
                        onChange={(e) => handleInputChange("date", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Chief Complaint */}
                  <div className="space-y-2">
                    <Label htmlFor="chiefComplaint">Chief Complaint</Label>
                    <Input
                      id="chiefComplaint"
                      value={recordForm.chiefComplaint}
                      onChange={(e) => handleInputChange("chiefComplaint", e.target.value)}
                      placeholder="Patient's main concern..."
                    />
                  </div>

                  {/* Symptoms */}
                  <div className="space-y-2">
                    <Label htmlFor="symptoms">Symptoms & History</Label>
                    <textarea
                      id="symptoms"
                      className="w-full p-2 border rounded-md"
                      rows={3}
                      value={recordForm.symptoms}
                      onChange={(e) => handleInputChange("symptoms", e.target.value)}
                      placeholder="Detailed symptoms and patient history..."
                    />
                  </div>

                  {/* Diagnosis */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="diagnosis">Diagnosis</Label>
                      <Select value={recordForm.icdCode} onValueChange={handleDiagnosisSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select diagnosis" />
                        </SelectTrigger>
                        <SelectContent>
                          {commonDiagnoses.map((diagnosis) => (
                            <SelectItem key={diagnosis.code} value={diagnosis.code}>
                              {diagnosis.name} ({diagnosis.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="icdCode">ICD Code</Label>
                      <Input
                        id="icdCode"
                        value={recordForm.icdCode}
                        onChange={(e) => handleInputChange("icdCode", e.target.value)}
                        placeholder="ICD-10 code"
                      />
                    </div>
                  </div>

                  {/* Custom Diagnosis */}
                  <div className="space-y-2">
                    <Label htmlFor="customDiagnosis">Custom Diagnosis (if not in list)</Label>
                    <Input
                      id="customDiagnosis"
                      value={recordForm.diagnosis}
                      onChange={(e) => handleInputChange("diagnosis", e.target.value)}
                      placeholder="Enter custom diagnosis..."
                    />
                  </div>

                  {/* Prescription */}
                  <div className="space-y-2">
                    <Label htmlFor="prescription">Prescription</Label>
                    <textarea
                      id="prescription"
                      className="w-full p-2 border rounded-md"
                      rows={3}
                      value={recordForm.prescription}
                      onChange={(e) => handleInputChange("prescription", e.target.value)}
                      placeholder="Medications, dosages, and instructions..."
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Clinical Notes</Label>
                    <textarea
                      id="notes"
                      className="w-full p-2 border rounded-md"
                      rows={3}
                      value={recordForm.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      placeholder="Additional clinical observations..."
                    />
                  </div>

                  {/* Follow-up */}
                  <div className="space-y-2">
                    <Label htmlFor="followUp">Follow-up Instructions</Label>
                    <Input
                      id="followUp"
                      value={recordForm.followUp}
                      onChange={(e) => handleInputChange("followUp", e.target.value)}
                      placeholder="Next appointment or follow-up instructions..."
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
                      disabled={!recordForm.patientId || !recordForm.chiefComplaint || !recordForm.diagnosis}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Finalize Record
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