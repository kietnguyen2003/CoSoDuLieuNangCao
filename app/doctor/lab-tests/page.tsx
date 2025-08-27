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
import { ArrowLeft, Save, FlaskConical, User, Calendar, Plus, Edit, Search, Clock } from "lucide-react"
import { labTestAPI, medicalRecordAPI, type LabTest as APILabTest } from "@/lib/api"

interface LabTestForm {
  ma_xet_nghiem?: string
  ma_ho_so: string
  loai_xet_nghiem: string
  ngay_xet_nghiem?: string
  ket_qua?: string
  ghi_chu?: string
  status?: string
}

export default function LabTestManagement() {
  const [userRole, setUserRole] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedLabTest, setSelectedLabTest] = useState<any | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [labTests, setLabTests] = useState<any[]>([])
  const [medicalRecords, setMedicalRecords] = useState<any[]>([])
  const [labTestTypes, setLabTestTypes] = useState<string[]>([])
  const router = useRouter()

  // Form state - using database field names
  const [labTestForm, setLabTestForm] = useState<LabTestForm>({
    ma_ho_so: "",
    loai_xet_nghiem: "",
    ngay_xet_nghiem: new Date().toISOString().split('T')[0],
    ghi_chu: "",
    status: "pending"
  })

  // Load data from APIs
  useEffect(() => {
    if (userRole) {
      loadLabTests()
      loadMedicalRecords()
      loadLabTestTypes()
    }
  }, [userRole])

  const loadLabTests = async () => {
    setIsLoading(true)
    try {
      const response = await labTestAPI.getLabTests()
      if (response.success && response.data) {
        setLabTests(response.data)
      }
    } catch (error) {
      console.error("Failed to load lab tests:", error)
      setLabTests([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadMedicalRecords = async () => {
    try {
      const response = await medicalRecordAPI.getMedicalRecords()
      if (response.success && response.data) {
        setMedicalRecords(response.data)
      }
    } catch (error) {
      console.error("Failed to load medical records:", error)
    }
  }

  const loadLabTestTypes = async () => {
    try {
      const response = await labTestAPI.getLabTestTypes()
      if (response.success && response.data) {
        setLabTestTypes(response.data)
      }
    } catch (error) {
      console.error("Failed to load lab test types:", error)
      setLabTestTypes([])
    }
  }


  const defaultLabTestTypes = [
    "Complete Blood Count", "Basic Metabolic Panel", "Hemoglobin A1c", "Lipid Panel", 
    "Liver Function Tests", "Thyroid Function", "Troponin I", "CK-MB", "Blood Culture", 
    "Urine Culture", "C-Reactive Protein", "ESR", "Prothrombin Time"
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
  }, [router])

  const handleInputChange = (field: string, value: string) => {
    setLabTestForm(prev => ({ ...prev, [field]: value }))
  }

  const handleMedicalRecordSelect = (maHoSo: string) => {
    const record = medicalRecords.find(r => r.ma_ho_so === maHoSo)
    if (record) {
      setLabTestForm(prev => ({
        ...prev,
        ma_ho_so: record.ma_ho_so
      }))
    }
  }


  const handleSave = async () => {
    if (!labTestForm.ma_ho_so || !labTestForm.loai_xet_nghiem) return

    setIsSaving(true)
    setError("")
    setSuccessMessage("")

    try {
      let response
      if (selectedLabTest) {
        // Update existing lab test
        response = await labTestAPI.updateLabTest(selectedLabTest.ma_xet_nghiem, {
          ket_qua: labTestForm.ket_qua,
          ghi_chu: labTestForm.ghi_chu,
          loai_xet_nghiem: labTestForm.loai_xet_nghiem,
          ngay_xet_nghiem: labTestForm.ngay_xet_nghiem
        })
      } else {
        // Create new lab test order
        response = await labTestAPI.createLabOrder(labTestForm)
      }

      if (response.success) {
        setSuccessMessage(selectedLabTest ? "Lab test updated successfully!" : "Lab test order created successfully!")
        setIsEditing(false)
        setSelectedLabTest(null)
        setLabTestForm({
          ma_ho_so: "",
          loai_xet_nghiem: "",
          ngay_xet_nghiem: new Date().toISOString().split('T')[0],
          ghi_chu: "",
          status: "pending"
        })
        loadLabTests() // Reload data
        setTimeout(() => setSuccessMessage(""), 5000)
      } else {
        setError(response.message || "Failed to save lab test")
      }
    } catch (error) {
      console.error("Failed to save lab test:", error)
      setError("Failed to save lab test. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditLabTest = (labTest: any) => {
    setSelectedLabTest(labTest)
    setLabTestForm({
      ma_ho_so: labTest.ma_ho_so,
      loai_xet_nghiem: labTest.loai_xet_nghiem,
      ngay_xet_nghiem: labTest.ngay_xet_nghiem ? labTest.ngay_xet_nghiem.split('T')[0] : new Date().toISOString().split('T')[0],
      ket_qua: labTest.ket_qua || "",
      ghi_chu: labTest.ghi_chu || "",
      status: labTest.status || "pending"
    })
    setIsEditing(true)
  }

  const handleNewLabTest = () => {
    setSelectedLabTest(null)
    setLabTestForm({
      ma_ho_so: "",
      loai_xet_nghiem: "",
      ngay_xet_nghiem: new Date().toISOString().split('T')[0],
      ghi_chu: "",
      status: "pending"
    })
    setIsEditing(true)
  }

  const goBack = () => {
    router.push("/doctor")
  }

  const filteredLabTests = labTests.filter(labTest =>
    (labTest.ten_khach_hang || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (labTest.ma_xet_nghiem || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (labTest.loai_xet_nghiem || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-100 text-blue-800"
      case "collected":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-purple-100 text-purple-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!userRole) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={userRole} userEmail={userEmail} />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
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
          {/* Lab Orders List */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FlaskConical className="h-5 w-5 text-blue-600" />
                  <span>Lab Orders</span>
                </div>
                <Button onClick={handleNewLabTest} size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Lab Test
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by patient name or order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {isLoading ? (
                <Alert>
                  <AlertDescription>Loading lab tests...</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredLabTests.map((labTest, index) => (
                    <Card key={`labtest-${labTest.ma_xet_nghiem}-${index}`} className="border-l-4 border-l-purple-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">{labTest.ten_khach_hang || 'Unknown Patient'}</div>
                            <div className="text-sm text-gray-600">Test ID: {labTest.ma_xet_nghiem}</div>
                            <div className="text-xs text-gray-500">Record: {labTest.ma_ho_so}</div>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            <Badge className={getStatusColor(labTest.status)}>
                              {labTest.status}
                            </Badge>
                            <Button size="sm" variant="outline" onClick={() => handleEditLabTest(labTest)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-3 w-3 text-gray-500" />
                            <span>{labTest.ngay_xet_nghiem}</span>
                          </div>
                          <p><strong>Test Type:</strong> {labTest.loai_xet_nghiem}</p>
                          {labTest.ket_qua && (
                            <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                              <strong>Results:</strong> {labTest.ket_qua}
                            </div>
                          )}
                          {labTest.ghi_chu && (
                            <p><strong>Notes:</strong> {labTest.ghi_chu}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {!isLoading && filteredLabTests.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FlaskConical className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No lab tests found</p>
                      <p className="text-sm text-gray-400 mt-2">Create a new lab test to get started</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lab Order Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FlaskConical className="h-5 w-5 text-green-600" />
                <span>{selectedLabTest ? "Edit Lab Test" : "Create Lab Test"}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  {/* Medical Record & Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ma_ho_so">Medical Record</Label>
                      <Select value={labTestForm.ma_ho_so} onValueChange={handleMedicalRecordSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select medical record" />
                        </SelectTrigger>
                        <SelectContent>
                          {medicalRecords.map((record, index) => (
                            <SelectItem key={`record-${record.ma_ho_so}-${index}`} value={record.ma_ho_so}>
                              {record.ten_khach_hang || 'Unknown Patient'} - {record.ma_ho_so} ({record.ngay_kham})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ngay_xet_nghiem">Test Date</Label>
                      <Input
                        id="ngay_xet_nghiem"
                        type="date"
                        value={labTestForm.ngay_xet_nghiem}
                        onChange={(e) => handleInputChange("ngay_xet_nghiem", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Test Type */}
                  <div className="space-y-2">
                    <Label htmlFor="loai_xet_nghiem">Test Type</Label>
                    {labTestTypes.length > 0 ? (
                      <Select value={labTestForm.loai_xet_nghiem} onValueChange={(value) => handleInputChange("loai_xet_nghiem", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select test type" />
                        </SelectTrigger>
                        <SelectContent>
                          {labTestTypes.map((testType, index) => (
                            <SelectItem key={`testtype-${testType}-${index}`} value={testType}>
                              {testType}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select value={labTestForm.loai_xet_nghiem} onValueChange={(value) => handleInputChange("loai_xet_nghiem", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select test type" />
                        </SelectTrigger>
                        <SelectContent>
                          {defaultLabTestTypes.map((testType, index) => (
                            <SelectItem key={`default-testtype-${testType}-${index}`} value={testType}>
                              {testType}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Test Results (if editing existing test) */}
                  {selectedLabTest && (
                    <div className="space-y-2">
                      <Label htmlFor="ket_qua">Test Results</Label>
                      <textarea
                        id="ket_qua"
                        className="w-full p-2 border rounded-md"
                        rows={3}
                        value={labTestForm.ket_qua}
                        onChange={(e) => handleInputChange("ket_qua", e.target.value)}
                        placeholder="Enter test results..."
                      />
                    </div>
                  )}

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={labTestForm.status} onValueChange={(value) => handleInputChange("status", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="collected">Collected</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="ghi_chu">Notes</Label>
                    <textarea
                      id="ghi_chu"
                      className="w-full p-2 border rounded-md"
                      rows={3}
                      value={labTestForm.ghi_chu}
                      onChange={(e) => handleInputChange("ghi_chu", e.target.value)}
                      placeholder="Clinical indication and additional notes..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 justify-end pt-4">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave} 
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={isSaving || !labTestForm.ma_ho_so || !labTestForm.loai_xet_nghiem}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? "Saving..." : (selectedLabTest ? "Update Lab Test" : "Create Lab Test")}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FlaskConical className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Select a lab test to edit or create a new lab test</p>
                  <Button onClick={handleNewLabTest} className="mt-4 bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Lab Test
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