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
import { Calendar, Download, User, FileText, Settings, Shield, Edit, FlaskConical, Eye, X, Pill, ClipboardList, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { clinicAPI, appointmentAPI, medicalRecordAPI, type MedicalRecord } from "@/lib/api"

export default function CustomerDashboard() {
  const [userRole, setUserRole] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [selectedClinic, setSelectedClinic] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("")
  const [notes, setNotes] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isBooking, setIsBooking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [clinics, setClinics] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [previouslyVisitedDoctors, setPreviouslyVisitedDoctors] = useState<any[]>([])
  const [otherDoctors, setOtherDoctors] = useState<any[]>([])
  const [specialties, setSpecialties] = useState<string[]>([])
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  
  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    const email = localStorage.getItem("userEmail")

    if (!role || role !== "customer") {
      router.push("/")
      return
    }

    setUserRole(role)
    setUserEmail(email || "")
    
    // Load initial data
    loadClinics()
    loadSpecialties()
    loadMedicalRecords()
  }, [router])

  const loadClinics = async () => {
    setIsLoading(true)
    try {
      const response = await clinicAPI.getClinics()
      if (response.success && response.data) {
        setClinics(response.data)
      }
    } catch (error) {
      console.error("Failed to load clinics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadSpecialties = async () => {
    try {
      const response = await clinicAPI.getSpecialties()
      if (response.success && response.data) {
        setSpecialties(response.data)
      }
    } catch (error) {
      console.error("Failed to load specialties:", error)
    }
  }

  const loadDoctorsForClinic = async (clinicId: string, specialty?: string) => {
    try {
      const response = await clinicAPI.getDoctors(clinicId, specialty)
      console.log("Doctors API response:", response) // Debug log
      if (response.success && response.data) {
        console.log("Doctors data:", response.data) // Debug log
        // Handle the new response structure
        if (typeof response.data === 'object' && 'all_doctors' in response.data) {
          setDoctors(response.data.all_doctors)
          setPreviouslyVisitedDoctors(response.data.previously_visited || [])
          setOtherDoctors(response.data.other_doctors || [])
        } else {
          // Fallback for old response format
          setDoctors(response.data)
          setPreviouslyVisitedDoctors([])
          setOtherDoctors(response.data)
        }
      } else {
        console.log("No doctors data or API failed") // Debug log
        setDoctors([])
        setPreviouslyVisitedDoctors([])
        setOtherDoctors([])
      }
    } catch (error) {
      console.error("Failed to load doctors:", error)
      setDoctors([])
      setPreviouslyVisitedDoctors([])
      setOtherDoctors([])
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

  const handleViewRecordDetail = (record: MedicalRecord) => {
    // Use the record data directly - no API call needed!
    setSelectedRecord(record)
    setIsDetailModalOpen(true)
  }

  const loadAvailableTimeSlots = async (clinicId: string, doctorId: string, date: string) => {
    try {
      const response = await clinicAPI.getSchedules(clinicId, doctorId, date)
      console.log("Schedules API response:", response)
      if (response.success && response.data) {
        console.log("Available slots from API:", response.data.available_slots)
        setAvailableTimeSlots(response.data.available_slots || [])
      } else {
        setAvailableTimeSlots([])
      }
    } catch (error) {
      console.error("Failed to load available time slots:", error)
      setAvailableTimeSlots([])
    }
  }

  const handleClinicChange = (clinicId: string) => {
    setSelectedClinic(clinicId)
    setSelectedDoctor("")
    setSelectedTime("")
    setAvailableTimeSlots([])
    if (clinicId) {
      loadDoctorsForClinic(clinicId, selectedSpecialty === "all" ? undefined : selectedSpecialty)
    } else {
      setDoctors([])
      setPreviouslyVisitedDoctors([])
      setOtherDoctors([])
    }
  }

  const handleSpecialtyChange = (specialty: string) => {
    setSelectedSpecialty(specialty)
    setSelectedDoctor("")
    setSelectedTime("")
    setAvailableTimeSlots([])
    if (selectedClinic) {
      loadDoctorsForClinic(selectedClinic, specialty === "all" ? undefined : specialty)
    }
  }

  const handleDoctorChange = (doctorId: string) => {
    setSelectedDoctor(doctorId)
    setSelectedTime("")
    setAvailableTimeSlots([])
    if (selectedClinic && doctorId && doctorId !== "no-doctors" && selectedDate) {
      loadAvailableTimeSlots(selectedClinic, doctorId, selectedDate)
    }
  }

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    setSelectedTime("")
    setAvailableTimeSlots([])
    if (selectedClinic && selectedDoctor && selectedDoctor !== "no-doctors" && date) {
      loadAvailableTimeSlots(selectedClinic, selectedDoctor, date)
    }
  }

  const handleBookAppointment = async () => {
    // Debug logging
    console.log("=== APPOINTMENT BOOKING DEBUG ===")
    console.log("selectedClinic:", selectedClinic)
    console.log("selectedDoctor:", selectedDoctor)
    console.log("selectedDate:", selectedDate)
    console.log("selectedTime:", selectedTime)
    console.log("notes:", notes)
    console.log("===================================")

    if (!selectedClinic || !selectedDoctor || selectedDoctor === "no-doctors" || !selectedDate || !selectedTime) {
      setSuccessMessage("Please fill in all required fields")
      setTimeout(() => setSuccessMessage(""), 3000)
      return
    }

    setIsBooking(true)
    try {
      const appointmentDateTime = `${selectedDate} ${selectedTime}:00`
      
      const appointmentData = {
        ma_bac_si: selectedDoctor, // This should be userID from doctor selection
        ma_phong_kham: selectedClinic,
        ngay_gio_kham: appointmentDateTime,
        ghi_chu: notes || undefined
      }
      
      console.log("Sending appointment data:", appointmentData)
      
      const response = await appointmentAPI.createAppointment(appointmentData)

      if (response.success) {
        setSuccessMessage("Appointment booked successfully! SMS and email confirmation sent.")
        setSelectedClinic("")
        setSelectedDoctor("")
        setSelectedDate("")
        setSelectedTime("")
        setSelectedSpecialty("")
        setNotes("")
        setDoctors([])
        setPreviouslyVisitedDoctors([])
        setOtherDoctors([])
        setAvailableTimeSlots([])
      } else {
        setSuccessMessage(`Failed to book appointment: ${response.message}`)
      }
    } catch (error) {
      console.error("Booking appointment error:", error)
      setSuccessMessage("Failed to book appointment. Please try again.")
    } finally {
      setIsBooking(false)
      setTimeout(() => setSuccessMessage(""), 5000)
    }
  }

  if (!userRole) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={userRole} userEmail={userEmail} />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Quick Actions */}
        <div className="mb-6">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => router.push("/customer/profile")} variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Profile Settings
                </Button>
                <Button onClick={() => router.push("/customer/change-password")} variant="outline" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
                <Button onClick={() => router.push("/customer/appointments")} variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Manage Appointments
                </Button>
                <Button onClick={() => router.push("/customer/lab-results")} variant="outline" size="sm">
                  <FlaskConical className="h-4 w-4 mr-2" />
                  Lab Results
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {successMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Book Appointment Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>Book Appointment</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2 relative">
                <Label htmlFor="clinic">Select Clinic</Label>
                <Select value={selectedClinic} onValueChange={handleClinicChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a clinic" />
                  </SelectTrigger>
                  <SelectContent className="z-50 max-h-60">
                    {clinics.map((clinic, index) => (
                      <SelectItem key={`clinic-${clinic.ma_phong_kham}-${index}`} value={clinic.ma_phong_kham}>
                        {clinic.ten_phong_kham}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="specialty">Filter by Specialty (Optional)</Label>
                <Select value={selectedSpecialty} onValueChange={handleSpecialtyChange} disabled={!selectedClinic}>
                  <SelectTrigger>
                    <SelectValue placeholder="All specialties" />
                  </SelectTrigger>
                  <SelectContent className="z-40 max-h-60">
                    <SelectItem value="all">All specialties</SelectItem>
                    {specialties.map((specialty, index) => (
                      <SelectItem key={`specialty-${specialty}-${index}`} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="doctor">Select Doctor</Label>
                <Select value={selectedDoctor} onValueChange={handleDoctorChange} disabled={!selectedClinic}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a doctor" />
                  </SelectTrigger>
                  <SelectContent className="z-30 max-h-60">
                    {previouslyVisitedDoctors && previouslyVisitedDoctors.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50">
                          Previously Visited Doctors
                        </div>
                        {previouslyVisitedDoctors.map((doctor, index) => {
                          const doctorId = doctor.ma_user || doctor.userID || doctor.ma_bac_si || `doctor-${index}`
                          const doctorName = doctor.ho_ten || doctor.hoTen || "Unknown Doctor"
                          const specialty = doctor.chuyen_khoa || doctor.chuyenKhoa
                          
                          return (
                            <SelectItem key={`prev-doctor-${doctorId}-${index}`} value={doctorId}>
                              ⭐ {doctorName} {specialty && `- ${specialty}`}
                            </SelectItem>
                          )
                        })}
                        {otherDoctors && otherDoctors.length > 0 && (
                          <div className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-50">
                            Other Doctors
                          </div>
                        )}
                      </>
                    )}
                    {otherDoctors && otherDoctors.length > 0 ? (
                      otherDoctors.map((doctor, index) => {
                        const doctorId = doctor.ma_user || doctor.userID || doctor.ma_bac_si || `doctor-${index}`
                        const doctorName = doctor.ho_ten || doctor.hoTen || "Unknown Doctor"
                        const specialty = doctor.chuyen_khoa || doctor.chuyenKhoa
                        
                        return (
                          <SelectItem key={`other-doctor-${doctorId}-${index}`} value={doctorId}>
                            {doctorName} {specialty && `- ${specialty}`}
                          </SelectItem>
                        )
                      })
                    ) : previouslyVisitedDoctors.length === 0 ? (
                      <SelectItem key="no-doctors" value="no-doctors" disabled>
                        No doctors available
                      </SelectItem>
                    ) : null}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Appointment Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="time">Available Time Slots</Label>
                <Select 
                  value={selectedTime} 
                  onValueChange={setSelectedTime} 
                  disabled={!selectedDoctor || selectedDoctor === "no-doctors" || !selectedDate || availableTimeSlots.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={
                        !selectedDoctor || selectedDoctor === "no-doctors" 
                          ? "Select doctor and date first" 
                          : !selectedDate 
                          ? "Select date first"
                          : availableTimeSlots.length === 0 
                          ? "No available slots" 
                          : "Choose a time"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent className="z-20 max-h-40">
                    {availableTimeSlots.map((time, index) => (
                      <SelectItem key={`time-${time}-${index}`} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableTimeSlots.length === 0 && selectedDoctor && selectedDoctor !== "no-doctors" && selectedDate && (
                  <p className="text-xs text-gray-500">
                    Loading available time slots...
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requests or notes..."
                />
              </div>

              <Button 
                onClick={handleBookAppointment} 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isBooking || !selectedClinic || !selectedDoctor || selectedDoctor === "no-doctors" || !selectedDate || !selectedTime}
              >
                {isBooking ? "Booking..." : "Book Appointment"}
              </Button>
            </CardContent>
          </Card>

          {/* Medical History Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-green-600" />
                <span>Hồ sơ của bé</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {medicalRecords.length > 0 ? (
                  medicalRecords.map((record) => {
                    const recordDate = new Date(record.ngay_kham)
                    return (
                      <Card key={record.ma_ho_so} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>{recordDate.toLocaleDateString()}</span>
                              <User className="h-4 w-4 ml-2" />
                              <span>Doctor</span>
                            </div>
                            <div className="flex space-x-1">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-xs"
                                onClick={() => handleViewRecordDetail(record)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Details
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs bg-transparent">
                                <Download className="h-3 w-3 mr-1" />
                                PDF
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            {record.trieu_chung && (
                              <p>
                                <strong>Symptoms:</strong> {record.trieu_chung}
                              </p>
                            )}
                            {record.chan_doan && (
                              <p>
                                <strong>Diagnosis:</strong> {record.chan_doan}
                              </p>
                            )}
                            {record.huong_dan_dieu_tri && (
                              <p>
                                <strong>Treatment:</strong> {record.huong_dan_dieu_tri}
                              </p>
                            )}
                            {record.ngay_tai_kham && (
                              <p>
                                <strong>Follow-up:</strong> {new Date(record.ngay_tai_kham).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No medical records available
                  </div>
                )}
              </div>
              <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                <p>🔒 Your medical data is protected under HIPAA-compliant privacy standards.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Medical Record Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Chi tiết khám bệnh</span>
              {selectedRecord && (
                <span className="text-sm text-gray-500 ml-2">
                  {new Date(selectedRecord.ngay_kham).toLocaleDateString()}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRecord ? (
            <div className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thông tin cơ bản</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Bệnh nhân:</strong> {selectedRecord.ten_khach_hang}
                    </div>
                    <div>
                      <strong>Bác sĩ khám:</strong> {selectedRecord.ten_bac_si}
                    </div>
                    <div>
                      <strong>Phòng khám:</strong> {selectedRecord.ten_phong_kham}
                    </div>
                    <div>
                      <strong>Ngày khám:</strong> {new Date(selectedRecord.ngay_kham).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Symptoms & Diagnosis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Triệu chứng và Chẩn đoán</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedRecord.trieu_chung && (
                    <div>
                      <strong className="text-red-600">Triệu chứng:</strong>
                      <p className="mt-1 p-2 bg-red-50 rounded">{selectedRecord.trieu_chung}</p>
                    </div>
                  )}
                  {selectedRecord.chan_doan && (
                    <div>
                      <strong className="text-blue-600">Chẩn đoán:</strong>
                      <p className="mt-1 p-2 bg-blue-50 rounded">{selectedRecord.chan_doan}</p>
                    </div>
                  )}
                  {selectedRecord.huong_dan_dieu_tri && (
                    <div>
                      <strong className="text-green-600">Hướng dẫn điều trị:</strong>
                      <p className="mt-1 p-2 bg-green-50 rounded">{selectedRecord.huong_dan_dieu_tri}</p>
                    </div>
                  )}
                  {selectedRecord.ma_icd10 && (
                    <div>
                      <strong>Mã ICD-10:</strong> {selectedRecord.ma_icd10}
                    </div>
                  )}
                  {selectedRecord.ngay_tai_kham && (
                    <div>
                      <strong>Ngày tái khám:</strong> {new Date(selectedRecord.ngay_tai_kham).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Prescriptions */}
              {selectedRecord.prescriptions && selectedRecord.prescriptions.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <Pill className="h-5 w-5 text-green-600" />
                      <span>Đơn thuốc</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedRecord.prescriptions.map((prescription: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4 mb-4 bg-green-50">
                        <div className="flex justify-between items-center mb-2">
                          <strong>Đơn thuốc #{prescription.ma_don_thuoc}</strong>
                          <span className="text-sm text-gray-600">
                            {new Date(prescription.ngay_ke_don).toLocaleDateString()}
                          </span>
                        </div>
                        {prescription.ghi_chu && (
                          <p className="text-sm text-gray-600 mb-3">{prescription.ghi_chu}</p>
                        )}
                        <div className="space-y-2">
                          {prescription.medicines?.map((med: any, medIndex: number) => (
                            <div key={medIndex} className="bg-white p-3 rounded border">
                              <div className="font-medium">{med.ten_thuoc}</div>
                              <div className="text-sm text-gray-600">
                                <div><strong>Số lượng:</strong> {med.so_luong}</div>
                                <div><strong>Cách dùng:</strong> {med.cach_dung}</div>
                                {med.ghi_chu && <div><strong>Ghi chú:</strong> {med.ghi_chu}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <Pill className="h-5 w-5 text-gray-400" />
                      <span>Đơn thuốc</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4 text-gray-500">
                      Không có đơn thuốc cho lần khám này
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Lab Tests */}
              {selectedRecord.lab_tests && selectedRecord.lab_tests.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <ClipboardList className="h-5 w-5 text-purple-600" />
                      <span>Kết quả xét nghiệm</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedRecord.lab_tests.map((test: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4 mb-4 bg-purple-50">
                        <div className="flex justify-between items-center mb-2">
                          <strong>{test.loai_xet_nghiem}</strong>
                          <span className="text-sm text-gray-600">
                            {new Date(test.ngay_xet_nghiem).toLocaleDateString()}
                          </span>
                        </div>
                        {test.ket_qua && (
                          <div className="bg-white p-3 rounded border">
                            <strong>Kết quả:</strong>
                            <p className="mt-1">{test.ket_qua}</p>
                          </div>
                        )}
                        {test.ghi_chu && (
                          <p className="text-sm text-gray-600 mt-2">{test.ghi_chu}</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Close Button */}
              <div className="flex justify-end">
                <Button onClick={() => setIsDetailModalOpen(false)} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Đóng
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500">Không có dữ liệu</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
