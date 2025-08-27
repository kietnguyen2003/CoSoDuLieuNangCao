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
import { ArrowLeft, Save, Calendar, Clock, MapPin, Plus, Edit, AlertTriangle } from "lucide-react"
import { scheduleAPI, clinicAPI } from "@/lib/api"

interface ScheduleForm {
  ma_lich_lam_viec?: string
  ma_bac_si: string
  ma_phong_kham: string
  ngay_lam_viec: string
  gio_bat_dau: string
  gio_ket_thuc: string
  status?: string
}

export default function DoctorScheduleManagement() {
  const [userRole, setUserRole] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedWeek, setSelectedWeek] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [schedules, setSchedules] = useState<any[]>([])
  const [clinics, setClinics] = useState<any[]>([])
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null)
  const router = useRouter()

  // Form state - using database field names
  const [scheduleForm, setScheduleForm] = useState<ScheduleForm>({
    ma_bac_si: "",
    ma_phong_kham: "",
    ngay_lam_viec: new Date().toISOString().split('T')[0],
    gio_bat_dau: "09:00",
    gio_ket_thuc: "17:00",
    status: "active"
  })

  // Load data from APIs
  useEffect(() => {
    if (userRole) {
      loadSchedules()
      loadClinics()
    }
  }, [userRole])

  const loadSchedules = async () => {
    setIsLoading(true)
    try {
      const response = await scheduleAPI.getSchedules()
      if (response.success && response.data) {
        setSchedules(response.data)
      } else {
        setError("Failed to load schedules")
      }
    } catch (error) {
      console.error("Failed to load schedules:", error)
      setError("Failed to load schedules")
    } finally {
      setIsLoading(false)
    }
  }

  const loadClinics = async () => {
    try {
      const response = await clinicAPI.getClinics()
      if (response.success && response.data) {
        setClinics(response.data)
      }
    } catch (error) {
      console.error("Failed to load clinics:", error)
    }
  }

  // Mock schedule data for development
  const [mockWeekSchedule] = useState({
    weekStart: "2024-01-15",
    days: [
      {
        date: "2024-01-15",
        clinic: "Downtown Clinic",
        isWorkingDay: true,
        totalPatients: 8,
        notes: "Regular consultation day",
        timeSlots: [
          { id: "1", startTime: "09:00", endTime: "09:30", available: false, appointmentType: "consultation", patientId: "P001", patientName: "John Smith" },
          { id: "2", startTime: "09:30", endTime: "10:00", available: false, appointmentType: "follow-up", patientId: "P002", patientName: "Mary Johnson" },
          { id: "3", startTime: "10:00", endTime: "10:30", available: true, appointmentType: "consultation" },
          { id: "4", startTime: "10:30", endTime: "11:00", available: false, appointmentType: "consultation", patientId: "P003", patientName: "David Wilson" },
          { id: "5", startTime: "11:00", endTime: "11:30", available: true, appointmentType: "consultation" },
          { id: "6", startTime: "14:00", endTime: "14:30", available: false, appointmentType: "follow-up", patientId: "P004", patientName: "Sarah Brown" },
          { id: "7", startTime: "14:30", endTime: "15:00", available: true, appointmentType: "consultation" },
          { id: "8", startTime: "15:00", endTime: "15:30", available: false, appointmentType: "consultation", patientId: "P005", patientName: "Mike Davis" }
        ]
      },
      {
        date: "2024-01-16",
        clinic: "Westside Clinic",
        isWorkingDay: true,
        totalPatients: 6,
        notes: "Half day - afternoon only",
        timeSlots: [
          { id: "9", startTime: "14:00", endTime: "14:30", available: false, appointmentType: "consultation", patientId: "P006", patientName: "Lisa Garcia" },
          { id: "10", startTime: "14:30", endTime: "15:00", available: true, appointmentType: "consultation" },
          { id: "11", startTime: "15:00", endTime: "15:30", available: false, appointmentType: "follow-up", patientId: "P007", patientName: "Tom Wilson" },
          { id: "12", startTime: "15:30", endTime: "16:00", available: true, appointmentType: "consultation" },
          { id: "13", startTime: "16:00", endTime: "16:30", available: false, appointmentType: "consultation", patientId: "P008", patientName: "Emma Davis" },
          { id: "14", startTime: "16:30", endTime: "17:00", available: true, appointmentType: "consultation" }
        ]
      },
      {
        date: "2024-01-17",
        clinic: "Downtown Clinic",
        isWorkingDay: true,
        totalPatients: 10,
        notes: "Busy day - full schedule",
        timeSlots: [
          { id: "15", startTime: "09:00", endTime: "09:30", available: false, appointmentType: "consultation", patientId: "P009", patientName: "James Miller" },
          { id: "16", startTime: "09:30", endTime: "10:00", available: false, appointmentType: "emergency", patientId: "P010", patientName: "Anna Taylor" },
          { id: "17", startTime: "10:30", endTime: "11:00", available: false, appointmentType: "break" },
          { id: "18", startTime: "11:00", endTime: "11:30", available: false, appointmentType: "consultation", patientId: "P011", patientName: "Robert Brown" }
        ]
      },
      {
        date: "2024-01-18",
        clinic: "Eastside Clinic",
        isWorkingDay: true,
        totalPatients: 7,
        notes: "Regular day",
        timeSlots: []
      },
      {
        date: "2024-01-19",
        clinic: "Downtown Clinic",
        isWorkingDay: true,
        totalPatients: 9,
        notes: "Friday clinic",
        timeSlots: []
      },
      {
        date: "2024-01-20",
        clinic: "",
        isWorkingDay: false,
        totalPatients: 0,
        notes: "Weekend off",
        timeSlots: []
      },
      {
        date: "2024-01-21",
        clinic: "",
        isWorkingDay: false,
        totalPatients: 0,
        notes: "Weekend off",
        timeSlots: []
      }
    ]
  })

  const defaultClinics = [
    { ma_phong_kham: "PK001", ten_phong_kham: "Downtown Clinic" },
    { ma_phong_kham: "PK002", ten_phong_kham: "Westside Clinic" },
    { ma_phong_kham: "PK003", ten_phong_kham: "Eastside Clinic" }
  ]

  const timeSlotOptions = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
  ]

  const handleInputChange = (field: string, value: string) => {
    setScheduleForm(prev => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    const email = localStorage.getItem("userEmail")

    if (!role || role !== "doctor") {
      router.push("/")
      return
    }

    setUserRole(role)
    setUserEmail(email || "")
    
    // Set current week as default
    const today = new Date()
    const monday = new Date(today)
    monday.setDate(today.getDate() - today.getDay() + 1)
    setSelectedWeek(monday.toISOString().split('T')[0])
    
    // Set current doctor ID from localStorage or context
    const userInfo = localStorage.getItem('userInfo')
    if (userInfo) {
      const parsedInfo = JSON.parse(userInfo)
      setScheduleForm(prev => ({ ...prev, ma_bac_si: parsedInfo.ma_user || 'DOC001' }))
    } else {
      // Default doctor ID if not available
      setScheduleForm(prev => ({ ...prev, ma_bac_si: 'DOC001' }))
    }
  }, [router])

  const handleSave = async () => {
    if (!scheduleForm.ma_bac_si || !scheduleForm.ma_phong_kham || !scheduleForm.ngay_lam_viec) return

    setIsSaving(true)
    setError("")
    setSuccessMessage("")

    try {
      let response
      if (selectedSchedule) {
        // Update existing schedule
        response = await scheduleAPI.updateSchedule(selectedSchedule.ma_lich_lam_viec, scheduleForm)
      } else {
        // Create new schedule
        response = await scheduleAPI.createSchedule(scheduleForm)
      }

      if (response.success) {
        setSuccessMessage(selectedSchedule ? "Schedule updated successfully!" : "Schedule created successfully!")
        setIsEditing(false)
        setSelectedSchedule(null)
        setScheduleForm({
          ma_bac_si: scheduleForm.ma_bac_si, // Keep doctor ID
          ma_phong_kham: "",
          ngay_lam_viec: new Date().toISOString().split('T')[0],
          gio_bat_dau: "09:00",
          gio_ket_thuc: "17:00",
          status: "active"
        })
        loadSchedules() // Reload data
        setTimeout(() => setSuccessMessage(""), 5000)
      } else {
        setError(response.message || "Failed to save schedule")
      }
    } catch (error) {
      console.error("Failed to save schedule:", error)
      setError("Failed to save schedule. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditSchedule = (schedule: any) => {
    setSelectedSchedule(schedule)
    setScheduleForm({
      ma_lich_lam_viec: schedule.ma_lich_lam_viec,
      ma_bac_si: schedule.ma_bac_si,
      ma_phong_kham: schedule.ma_phong_kham,
      ngay_lam_viec: schedule.ngay_lam_viec ? schedule.ngay_lam_viec.split('T')[0] : new Date().toISOString().split('T')[0],
      gio_bat_dau: schedule.gio_bat_dau || "09:00",
      gio_ket_thuc: schedule.gio_ket_thuc || "17:00",
      status: schedule.status || "active"
    })
    setIsEditing(true)
  }

  const handleNewSchedule = () => {
    setSelectedSchedule(null)
    setScheduleForm({
      ma_bac_si: scheduleForm.ma_bac_si, // Keep current doctor ID
      ma_phong_kham: "",
      ngay_lam_viec: new Date().toISOString().split('T')[0],
      gio_bat_dau: "09:00",
      gio_ket_thuc: "17:00",
      status: "active"
    })
    setIsEditing(true)
  }


  const goBack = () => {
    router.push("/doctor")
  }

  const getDayName = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { weekday: 'long' })
  }

  const getSlotTypeColor = (type: string) => {
    switch (type) {
      case "consultation":
        return "bg-blue-100 text-blue-800"
      case "follow-up":
        return "bg-green-100 text-green-800"
      case "emergency":
        return "bg-red-100 text-red-800"
      case "break":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const displaySchedules = schedules.length > 0 ? schedules : []
  const displayClinics = clinics.length > 0 ? clinics : defaultClinics
  
  // Group schedules by date
  const groupSchedulesByWeek = (schedules: any[]) => {
    const grouped: { [key: string]: any[] } = {}
    schedules.forEach(schedule => {
      const date = schedule.ngay_lam_viec?.split('T')[0] || schedule.ngay_lam_viec
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(schedule)
    })
    return grouped
  }
  
  const weekSchedules = groupSchedulesByWeek(displaySchedules)

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Schedule List */}
          <Card className="shadow-lg lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span>Doctor Schedules</span>
                </div>
                <Button onClick={handleNewSchedule} size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Schedule
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            {isLoading ? (
              <Alert>
                <AlertDescription>Loading schedules...</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {displaySchedules.map((schedule, index) => (
                  <Card key={`schedule-${schedule.ma_lich_lam_viec}-${index}`} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">
                            {displayClinics.find(c => c.ma_phong_kham === schedule.ma_phong_kham)?.ten_phong_kham || schedule.ma_phong_kham}
                          </div>
                          <div className="text-sm text-gray-600">Schedule ID: {schedule.ma_lich_lam_viec}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={schedule.status === "active" ? "default" : "secondary"}>
                            {schedule.status || "active"}
                          </Badge>
                          <Button size="sm" variant="outline" onClick={() => handleEditSchedule(schedule)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-3 w-3 text-gray-500" />
                          <span>{schedule.ngay_lam_viec}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-3 w-3 text-gray-500" />
                          <span>{schedule.gio_bat_dau} - {schedule.gio_ket_thuc}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {!isLoading && displaySchedules.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No schedules found</p>
                  </div>
                )}
              </div>
            )}
            </CardContent>
          </Card>

          {/* Schedule Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <span>{selectedSchedule ? "Edit Schedule" : "Create Schedule"}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  {/* Clinic Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="ma_phong_kham">Clinic</Label>
                    <Select value={scheduleForm.ma_phong_kham} onValueChange={(value) => handleInputChange("ma_phong_kham", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select clinic" />
                      </SelectTrigger>
                      <SelectContent>
                        {displayClinics.map((clinic, index) => (
                          <SelectItem key={`clinic-${clinic.ma_phong_kham}-${index}`} value={clinic.ma_phong_kham}>
                            {clinic.ten_phong_kham}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Working Date */}
                  <div className="space-y-2">
                    <Label htmlFor="ngay_lam_viec">Working Date</Label>
                    <Input
                      id="ngay_lam_viec"
                      type="date"
                      value={scheduleForm.ngay_lam_viec}
                      onChange={(e) => handleInputChange("ngay_lam_viec", e.target.value)}
                    />
                  </div>

                  {/* Working Hours */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gio_bat_dau">Start Time</Label>
                      <Input
                        id="gio_bat_dau"
                        type="time"
                        value={scheduleForm.gio_bat_dau}
                        onChange={(e) => handleInputChange("gio_bat_dau", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gio_ket_thuc">End Time</Label>
                      <Input
                        id="gio_ket_thuc"
                        type="time"
                        value={scheduleForm.gio_ket_thuc}
                        onChange={(e) => handleInputChange("gio_ket_thuc", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={scheduleForm.status} onValueChange={(value) => handleInputChange("status", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 justify-end pt-4">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave} 
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={isSaving || !scheduleForm.ma_phong_kham || !scheduleForm.ngay_lam_viec}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? "Saving..." : (selectedSchedule ? "Update Schedule" : "Create Schedule")}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Select a schedule to edit or create a new schedule</p>
                  <Button onClick={handleNewSchedule} className="mt-4 bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Schedule
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