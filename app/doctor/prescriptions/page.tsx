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
import { ArrowLeft, Save, Pill, User, Calendar, Plus, Edit, Trash2, AlertTriangle, Search } from "lucide-react"
import { prescriptionAPI, medicalRecordAPI, type Prescription } from "@/lib/api"

interface MedicationForm {
  ma_thuoc: string
  ten_thuoc: string
  so_luong: number
  cach_dung: string
  ghi_chu?: string
}

export default function PrescriptionManagement() {
  const [userRole, setUserRole] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [medicalRecords, setMedicalRecords] = useState<any[]>([])
  const [medications, setMedications] = useState<any[]>([])
  const router = useRouter()

  // Form state - using database field names
  const [prescriptionForm, setPrescriptionForm] = useState({
    ma_ho_so: "",
    medications: [] as MedicationForm[],
    ghi_chu: ""
  })

  const [currentMedication, setCurrentMedication] = useState<Partial<MedicationForm>>({
    ma_thuoc: "",
    ten_thuoc: "",
    so_luong: 1,
    cach_dung: "",
    ghi_chu: ""
  })

  // Load data from APIs
  useEffect(() => {
    if (userRole) {
      loadPrescriptions()
      loadMedicalRecords()
      loadMedications()
    }
  }, [userRole])

  const loadPrescriptions = async () => {
    setIsLoading(true)
    try {
      const response = await prescriptionAPI.getPrescriptions()
      if (response.success && response.data) {
        setPrescriptions(response.data)
      } else {
        setError("Failed to load prescriptions")
      }
    } catch (error) {
      console.error("Failed to load prescriptions:", error)
      setError("Failed to load prescriptions")
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

  const loadMedications = async () => {
    try {
      const response = await prescriptionAPI.getMedications()
      if (response.success && response.data) {
        setMedications(response.data)
      }
    } catch (error) {
      console.error("Failed to load medications:", error)
    }
  }

  // Mock data for development (remove after API integration)
  const [mockPrescriptions] = useState<any[]>([
    {
      ma_don_thuoc: "RX001",
      ma_ho_so: "HS001",
      ten_khach_hang: "John Smith",
      ten_bac_si: "Dr. Current",
      ngay_ke_don: "2024-01-15",
      medications: [
        {
          ma_thuoc: "M001",
          ten_thuoc: "Amoxicillin",
          so_luong: 21,
          cach_dung: "500mg - 3 times daily for 7 days",
          ghi_chu: "Take with food"
        },
        {
          ma_thuoc: "M002",
          ten_thuoc: "Paracetamol",
          so_luong: 20,
          cach_dung: "500mg as needed",
          ghi_chu: "For fever/pain, max 4 times daily"
        }
      ],
      ghi_chu: "For upper respiratory tract infection"
    },
    {
      ma_don_thuoc: "RX002",
      ma_ho_so: "HS002",
      ten_khach_hang: "Mary Johnson",
      ten_bac_si: "Dr. Current",
      ngay_ke_don: "2024-01-12",
      medications: [
        {
          ma_thuoc: "M003",
          ten_thuoc: "Metformin",
          so_luong: 180,
          cach_dung: "850mg - 2 times daily for 3 months",
          ghi_chu: "Take with meals"
        }
      ],
      ghi_chu: "Diabetes management - regular prescription"
    }
  ])

  // Get patients from medical records
  const getPatients = () => {
    const patientsMap = new Map()
    medicalRecords.forEach(record => {
      if (!patientsMap.has(record.ma_customer)) {
        patientsMap.set(record.ma_customer, {
          ma_customer: record.ma_customer,
          ho_ten: record.ten_khach_hang || 'Unknown Patient',
          ma_ho_so: record.ma_ho_so
        })
      }
    })
    return Array.from(patientsMap.values())
  }

  const commonDosages = ["1x daily", "2x daily", "3x daily", "4x daily", "PRN (as needed)", "Every 6 hours", "Every 8 hours"]

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
    setPrescriptionForm(prev => ({ ...prev, [field]: value }))
  }

  const handleMedicationChange = (field: string, value: string) => {
    setCurrentMedication(prev => ({ ...prev, [field]: value }))
  }

  const handleMedicalRecordSelect = (maHoSo: string) => {
    const record = medicalRecords.find(r => r.ma_ho_so === maHoSo)
    if (record) {
      setPrescriptionForm(prev => ({
        ...prev,
        ma_ho_so: record.ma_ho_so
      }))
    }
  }

  const handleMedicationSelect = (medicationId: string) => {
    const medication = medications.find(m => m.ma_thuoc === medicationId)
    if (medication) {
      setCurrentMedication(prev => ({
        ...prev,
        ma_thuoc: medication.ma_thuoc,
        ten_thuoc: medication.ten_thuoc
      }))
    }
  }

  const addMedication = () => {
    if (!currentMedication.ma_thuoc || !currentMedication.ten_thuoc || !currentMedication.cach_dung) return

    const newMedication: MedicationForm = {
      ma_thuoc: currentMedication.ma_thuoc || "",
      ten_thuoc: currentMedication.ten_thuoc || "",
      so_luong: currentMedication.so_luong || 1,
      cach_dung: currentMedication.cach_dung || "",
      ghi_chu: currentMedication.ghi_chu || ""
    }

    setPrescriptionForm(prev => ({
      ...prev,
      medications: [...(prev.medications || []), newMedication]
    }))

    setCurrentMedication({
      ma_thuoc: "",
      ten_thuoc: "",
      so_luong: 1,
      cach_dung: "",
      ghi_chu: ""
    })
  }

  const removeMedication = (maThuoc: string) => {
    setPrescriptionForm(prev => ({
      ...prev,
      medications: prev.medications?.filter(m => m.ma_thuoc !== maThuoc) || []
    }))
  }

  const handleSave = async () => {
    if (!prescriptionForm.ma_ho_so || !prescriptionForm.medications?.length) return

    setIsSaving(true)
    setError("")
    setSuccessMessage("")

    try {
      let response
      if (selectedPrescription) {
        // Update existing prescription
        response = await prescriptionAPI.updatePrescription(selectedPrescription.ma_don_thuoc, prescriptionForm)
      } else {
        // Create new prescription
        response = await prescriptionAPI.createPrescription(prescriptionForm)
      }

      if (response.success) {
        setSuccessMessage(selectedPrescription ? "Prescription updated successfully!" : "Prescription created successfully!")
        setIsEditing(false)
        setSelectedPrescription(null)
        setPrescriptionForm({
          ma_ho_so: "",
          medications: [],
          ghi_chu: ""
        })
        loadPrescriptions() // Reload data
        setTimeout(() => setSuccessMessage(""), 5000)
      } else {
        setError(response.message || "Failed to save prescription")
      }
    } catch (error) {
      console.error("Failed to save prescription:", error)
      setError("Failed to save prescription. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditPrescription = (prescription: any) => {
    setSelectedPrescription(prescription)
    setPrescriptionForm({
      ma_ho_so: prescription.ma_ho_so,
      medications: prescription.medications || [],
      ghi_chu: prescription.ghi_chu || ""
    })
    setIsEditing(true)
  }

  const handleNewPrescription = () => {
    setSelectedPrescription(null)
    setPrescriptionForm({
      ma_ho_so: "",
      medications: [],
      ghi_chu: ""
    })
    setIsEditing(true)
  }

  const goBack = () => {
    router.push("/doctor")
  }

  const displayPrescriptions = prescriptions.length > 0 ? prescriptions : mockPrescriptions
  const filteredPrescriptions = displayPrescriptions.filter(prescription =>
    (prescription.ten_khach_hang || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (prescription.ma_don_thuoc || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedRecord = medicalRecords.find(r => r.ma_ho_so === prescriptionForm.ma_ho_so)

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prescriptions List */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Pill className="h-5 w-5 text-blue-600" />
                  <span>Prescriptions</span>
                </div>
                <Button onClick={handleNewPrescription} size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Prescription
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by patient name or prescription ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {isLoading ? (
                <Alert>
                  <AlertDescription>Loading prescriptions...</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredPrescriptions.map((prescription, index) => (
                    <Card key={`prescription-${prescription.ma_don_thuoc}-${index}`} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">{prescription.ten_khach_hang || 'Unknown Patient'}</div>
                            <div className="text-sm text-gray-600">ID: {prescription.ma_don_thuoc}</div>
                            <div className="text-xs text-gray-500">Record: {prescription.ma_ho_so}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="default">Active</Badge>
                            <Button size="sm" variant="outline" onClick={() => handleEditPrescription(prescription)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-3 w-3 text-gray-500" />
                            <span>{prescription.ngay_ke_don}</span>
                          </div>
                          <p><strong>Medications:</strong> {prescription.medications?.length || 0} item(s)</p>
                          <div className="ml-4">
                            {prescription.medications?.slice(0, 2).map((med, medIndex) => (
                              <p key={`med-${med.ma_thuoc}-${medIndex}`} className="text-xs text-gray-600">
                                • {med.ten_thuoc} ({med.so_luong}) - {med.cach_dung}
                              </p>
                            ))}
                            {(prescription.medications?.length || 0) > 2 && (
                              <p className="text-xs text-gray-500">... and {(prescription.medications?.length || 0) - 2} more</p>
                            )}
                          </div>
                          {prescription.ghi_chu && (
                            <p><strong>Notes:</strong> {prescription.ghi_chu}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {!isLoading && filteredPrescriptions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No prescriptions found</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prescription Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Pill className="h-5 w-5 text-green-600" />
                <span>{selectedPrescription ? "Edit Prescription" : "Create Prescription"}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  {/* Medical Record Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="ma_ho_so">Medical Record</Label>
                    <Select value={prescriptionForm.ma_ho_so} onValueChange={handleMedicalRecordSelect}>
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
                    {selectedRecord && (
                      <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                        <p><strong>Patient:</strong> {selectedRecord.ten_khach_hang}</p>
                        <p><strong>Diagnosis:</strong> {selectedRecord.chan_doan || 'N/A'}</p>
                        <p><strong>Visit Date:</strong> {selectedRecord.ngay_kham}</p>
                      </div>
                    )}
                  </div>

                  {/* Add Medication Section */}
                  <Card className="bg-blue-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Add Medication</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="ten_thuoc">Medication</Label>
                          {medications.length > 0 ? (
                            <Select value={currentMedication.ma_thuoc} onValueChange={handleMedicationSelect}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select medication" />
                              </SelectTrigger>
                              <SelectContent>
                                {medications.map((med, index) => (
                                  <SelectItem key={`medication-${med.ma_thuoc}-${index}`} value={med.ma_thuoc}>
                                    {med.ten_thuoc}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              id="ten_thuoc"
                              value={currentMedication.ten_thuoc}
                              onChange={(e) => handleMedicationChange("ten_thuoc", e.target.value)}
                              placeholder="Enter medication name"
                            />
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="so_luong">Quantity</Label>
                          <Input
                            id="so_luong"
                            type="number"
                            value={currentMedication.so_luong}
                            onChange={(e) => handleMedicationChange("so_luong", parseInt(e.target.value) || 1)}
                            placeholder="e.g., 21"
                            min="1"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="cach_dung">Usage Instructions</Label>
                          <Input
                            id="cach_dung"
                            value={currentMedication.cach_dung}
                            onChange={(e) => handleMedicationChange("cach_dung", e.target.value)}
                            placeholder="e.g., 500mg - 3 times daily for 7 days"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="ghi_chu_thuoc">Notes</Label>
                          <Input
                            id="ghi_chu_thuoc"
                            value={currentMedication.ghi_chu}
                            onChange={(e) => handleMedicationChange("ghi_chu", e.target.value)}
                            placeholder="e.g., Take with food"
                          />
                        </div>
                      </div>

                      <Button 
                        onClick={addMedication} 
                        size="sm" 
                        disabled={!currentMedication.ten_thuoc || !currentMedication.cach_dung}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Medication
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Medications List */}
                  {prescriptionForm.medications && prescriptionForm.medications.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Prescribed Medications</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {prescriptionForm.medications.map((medication, index) => (
                            <div key={`med-form-${medication.ma_thuoc}-${index}`} className="flex justify-between items-center p-2 border rounded">
                              <div className="text-sm">
                                <div className="font-medium">{medication.ten_thuoc} (Qty: {medication.so_luong})</div>
                                <div className="text-gray-600">{medication.cach_dung}</div>
                                {medication.ghi_chu && (
                                  <div className="text-gray-500 text-xs">{medication.ghi_chu}</div>
                                )}
                              </div>
                              <Button size="sm" variant="destructive" onClick={() => removeMedication(medication.ma_thuoc)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="ghi_chu">Prescription Notes</Label>
                    <textarea
                      id="ghi_chu"
                      className="w-full p-2 border rounded-md"
                      rows={3}
                      value={prescriptionForm.ghi_chu}
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
                      disabled={isSaving || !prescriptionForm.ma_ho_so || !prescriptionForm.medications?.length}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? "Saving..." : (selectedPrescription ? "Update Prescription" : "Create Prescription")}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Pill className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Select a prescription to edit or create a new prescription</p>
                  <Button onClick={handleNewPrescription} className="mt-4 bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Prescription
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