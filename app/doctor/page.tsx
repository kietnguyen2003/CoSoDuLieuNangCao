"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Search, FileText, AlertTriangle, Plus, Pill, FlaskConical, Clock } from "lucide-react"
import { appointmentAPI, medicalRecordAPI, type Appointment, type MedicalRecord } from "@/lib/api"

export default function DoctorDashboard() {
  const [userRole, setUserRole] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([])
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const router = useRouter()

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
    loadTodayAppointments()
    loadMedicalRecords()
  }, [router])

  const loadTodayAppointments = async () => {
    setIsLoading(true)
    try {
      const response = await appointmentAPI.getAppointments()
      if (response.success && response.data) {
        // Filter today's appointments
        const today = new Date()
        const todayStr = today.toDateString()
        const todayAppts = response.data.filter(apt => {
          const appointmentDate = new Date(apt.ngay_gio_kham)
          return appointmentDate.toDateString() === todayStr
        })
        setTodayAppointments(todayAppts)
        console.log("Today's appointments loaded:", response.data)
      }
    } catch (error) {
      console.error("Failed to load today's appointments:", error)
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

  const filteredRecords = medicalRecords.filter(
    (record) =>
      (record.ten_khach_hang || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.ma_ho_so.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.ma_customer.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    switch (statusLower) {
      case "scheduled":
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const hasConflicts = todayAppointments.some((apt) => apt.trang_thai.toLowerCase() === "cancelled")

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
                <Button onClick={() => router.push("/doctor/medical-records")} variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Medical Records
                </Button>
                <Button onClick={() => router.push("/doctor/prescriptions")} variant="outline" size="sm">
                  <Pill className="h-4 w-4 mr-2" />
                  Prescriptions
                </Button>
                <Button onClick={() => router.push("/doctor/lab-tests")} variant="outline" size="sm">
                  <FlaskConical className="h-4 w-4 mr-2" />
                  Lab Orders
                </Button>
                <Button onClick={() => router.push("/doctor/schedule")} variant="outline" size="sm">
                  <Clock className="h-4 w-4 mr-2" />
                  Manage Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Schedule Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span>My Schedule - Today</span>
                </div>
                {hasConflicts && (
                  <div className="flex items-center space-x-1 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">Schedule Alert</span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayAppointments.length > 0 ? (
                  todayAppointments.map((appointment) => {
                    const appointmentDate = new Date(appointment.ngay_gio_kham)
                    const timeStr = appointmentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                    
                    return (
                      <div key={appointment.ma_lich_kham} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="text-sm font-medium text-gray-900">{timeStr}</div>
                          <div>
                            <div className="font-medium">{appointment.ten_khach_hang || "Unknown Patient"}</div>
                            <div className="text-sm text-gray-600">Appointment</div>
                          </div>
                        </div>
                        <Badge className={getStatusColor(appointment.trang_thai)}>{appointment.trang_thai}</Badge>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No appointments scheduled for today
                  </div>
                )}
              </div>

              {hasConflicts && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-red-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">Emergency appointment may cause schedule conflicts</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patient Records Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-green-600" />
                <span>Patient Records</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search patients by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Record
                </Button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => {
                    const recordDate = new Date(record.ngay_kham)
                    return (
                      <Card key={record.ma_ho_so} className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-medium">{record.ten_khach_hang || "Unknown Patient"}</div>
                              <div className="text-sm text-gray-600">Record ID: {record.ma_ho_so}</div>
                              <div className="text-sm text-gray-600">Patient ID: {record.ma_customer}</div>
                            </div>
                            <div className="text-sm text-gray-500">Visit: {recordDate.toLocaleDateString()}</div>
                          </div>
                          <div className="space-y-1 text-sm">
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
                            {record.ma_icd10 && (
                              <p>
                                <strong>ICD-10:</strong> {record.ma_icd10}
                              </p>
                            )}
                            {record.ngay_tai_kham && (
                              <p>
                                <strong>Follow-up:</strong> {new Date(record.ngay_tai_kham).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="mt-3 flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => router.push(`/doctor/medical-records?record=${record.ma_ho_so}`)}>
                              View Full Record
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => router.push('/doctor/medical-records?new=true')}>
                              Add Visit
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm ? "No records match your search" : "No medical records available"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
