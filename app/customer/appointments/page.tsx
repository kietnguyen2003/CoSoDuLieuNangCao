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
import { ArrowLeft, Calendar, Clock, User, X, Edit, AlertTriangle } from "lucide-react"
import { appointmentAPI, type Appointment } from "@/lib/api"

export default function AppointmentManagement() {
  const [userRole, setUserRole] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [selectedAction, setSelectedAction] = useState<"" | "cancel" | "reschedule">("")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Reschedule form state
  const [rescheduleForm, setRescheduleForm] = useState({
    newDate: "",
    newTime: "",
    reason: ""
  })

  // Cancel form state
  const [cancelReason, setCancelReason] = useState("")

  const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]

  // Helper function to format date/time without timezone conversion
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    // Use UTC methods to avoid timezone conversion
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    const hours = String(date.getUTCHours()).padStart(2, '0')
    const minutes = String(date.getUTCMinutes()).padStart(2, '0')
    
    return {
      date: `${day}/${month}/${year}`,
      time: `${hours}:${minutes}`
    }
  }

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    const email = localStorage.getItem("userEmail")

    if (!role || role !== "customer") {
      router.push("/")
      return
    }

    setUserRole(role)
    setUserEmail(email || "")
    
    // Load appointments
    loadAppointments()
  }, [router])

  const loadAppointments = async () => {
    setIsLoading(true)
    try {
      const response = await appointmentAPI.getAppointments()
      if (response.success && response.data) {
        setAppointments(response.data)
      }
      console.log("Loaded appointments:", response)
    } catch (error) {
      console.error("Failed to load appointments:", error)
    } finally {
      setIsLoading(false)
    }
  }

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

  const handleCancelAppointment = async () => {
    if (!selectedAppointment || !cancelReason.trim()) return

    try {
      const response = await appointmentAPI.cancelAppointment(selectedAppointment.ma_lich_kham)
      
      if (response.success) {
        setSuccessMessage(`Appointment cancelled successfully. Confirmation sent via SMS and email.`)
        setSelectedAction("")
        setSelectedAppointment(null)
        setCancelReason("")
        
        // Reload appointments
        await loadAppointments()
        
        setTimeout(() => setSuccessMessage(""), 5000)
      } else {
        setSuccessMessage(`Failed to cancel appointment: ${response.message}`)
      }
    } catch (error) {
      console.error("Cancel appointment error:", error)
      setSuccessMessage("Failed to cancel appointment. Please try again.")
    }
  }

  const handleRescheduleAppointment = async () => {
    if (!selectedAppointment || !rescheduleForm.newDate || !rescheduleForm.newTime) return

    try {
      const newDateTime = `${rescheduleForm.newDate} ${rescheduleForm.newTime}:00`
      
      const response = await appointmentAPI.updateAppointment(selectedAppointment.ma_lich_kham, {
        ngay_gio_kham: newDateTime,
        ghi_chu: rescheduleForm.reason || undefined
      })
      
      if (response.success) {
        setSuccessMessage(`Appointment rescheduled to ${rescheduleForm.newDate} at ${rescheduleForm.newTime}. Confirmation sent via SMS and email.`)
        setSelectedAction("")
        setSelectedAppointment(null)
        setRescheduleForm({ newDate: "", newTime: "", reason: "" })
        
        // Reload appointments
        await loadAppointments()
        
        setTimeout(() => setSuccessMessage(""), 5000)
      } else {
        setSuccessMessage(`Failed to reschedule appointment: ${response.message}`)
      }
    } catch (error) {
      console.error("Reschedule appointment error:", error)
      setSuccessMessage("Failed to reschedule appointment. Please try again.")
    }
  }

  const openCancelDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setSelectedAction("cancel")
  }

  const openRescheduleDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setSelectedAction("reschedule")
  }

  const closeDialog = () => {
    setSelectedAction("")
    setSelectedAppointment(null)
    setCancelReason("")
    setRescheduleForm({ newDate: "", newTime: "", reason: "" })
  }

  const goBack = () => {
    router.push("/customer")
  }

  const upcomingAppointments = appointments.filter(apt => {
    const appointmentDate = new Date(apt.ngay_gio_kham)
    return appointmentDate >= new Date() && apt.trang_thai.toLowerCase() !== "cancelled"
  })
  
  const pastAppointments = appointments.filter(apt => {
    const appointmentDate = new Date(apt.ngay_gio_kham)
    return appointmentDate < new Date() || apt.trang_thai.toLowerCase() === "cancelled"
  })

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

        {successMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Upcoming Appointments */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>Upcoming Appointments</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => {
                    const { date: appointmentDate, time: appointmentTime } = formatDateTime(appointment.ngay_gio_kham)
                    const canModify = appointment.trang_thai.toLowerCase() === "scheduled"
                    
                    return (
                    <Card key={appointment.ma_lich_kham} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-4">
                              <Badge className={getStatusColor(appointment.trang_thai)}>
                                {appointment.trang_thai}
                              </Badge>
                              <span className="text-sm text-gray-500">ID: {appointment.ma_lich_kham}</span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span>{appointmentDate}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span>{appointmentTime}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <span>{appointment.ten_bac_si || "Doctor"}</span>
                              </div>
                              <div className="text-gray-600">
                                {appointment.ten_phong_kham || "Clinic"}
                              </div>
                              {appointment.ghi_chu && (
                                <div className="col-span-2 text-gray-600 text-xs">
                                  <strong>Notes:</strong> {appointment.ghi_chu}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            {canModify && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openRescheduleDialog(appointment)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Reschedule
                              </Button>
                            )}
                            {canModify && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openCancelDialog(appointment)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No upcoming appointments
                </div>
              )}
            </CardContent>
          </Card>

          {/* Past Appointments */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-600" />
                <span>Past Appointments</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pastAppointments.length > 0 ? (
                <div className="space-y-4">
                  {pastAppointments.map((appointment) => {
                    const { date: appointmentDate, time: appointmentTime } = formatDateTime(appointment.ngay_gio_kham)
                    
                    return (
                    <Card key={appointment.ma_lich_kham} className="border-l-4 border-l-gray-300">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 opacity-75">
                            <div className="flex items-center space-x-4">
                              <Badge className={getStatusColor(appointment.trang_thai)}>
                                {appointment.trang_thai}
                              </Badge>
                              <span className="text-sm text-gray-500">ID: {appointment.ma_lich_kham}</span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span>{appointmentDate}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span>{appointmentTime}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <span>{appointment.ten_bac_si || "Doctor"}</span>
                              </div>
                              <div className="text-gray-600">
                                {appointment.ten_phong_kham || "Clinic"}
                              </div>
                              {appointment.ghi_chu && (
                                <div className="col-span-2 text-gray-600 text-xs">
                                  <strong>Notes:</strong> {appointment.ghi_chu}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No past appointments
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cancel Dialog */}
        {selectedAction === "cancel" && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Cancel Appointment</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-sm text-red-800">
                    <strong>Appointment Details:</strong><br />
                    {formatDateTime(selectedAppointment.ngay_gio_kham).date} at {formatDateTime(selectedAppointment.ngay_gio_kham).time}<br />
                    with {selectedAppointment.ten_bac_si || "Doctor"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cancelReason">Reason for cancellation (required)</Label>
                  <Select value={cancelReason} onValueChange={setCancelReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key="cancel-personal-emergency" value="personal-emergency">Personal Emergency</SelectItem>
                      <SelectItem key="cancel-illness" value="illness">Illness</SelectItem>
                      <SelectItem key="cancel-scheduling-conflict" value="scheduling-conflict">Scheduling Conflict</SelectItem>
                      <SelectItem key="cancel-travel" value="travel">Travel</SelectItem>
                      <SelectItem key="cancel-other" value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-2 justify-end">
                  <Button variant="outline" onClick={closeDialog}>
                    Keep Appointment
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleCancelAppointment}
                    disabled={!cancelReason}
                  >
                    Cancel Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reschedule Dialog */}
        {selectedAction === "reschedule" && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-600">
                  <Edit className="h-5 w-5" />
                  <span>Reschedule Appointment</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Current Appointment:</strong><br />
                    {formatDateTime(selectedAppointment.ngay_gio_kham).date} at {formatDateTime(selectedAppointment.ngay_gio_kham).time}<br />
                    with {selectedAppointment.ten_bac_si || "Doctor"}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newDate">New Date</Label>
                    <Input
                      id="newDate"
                      type="date"
                      value={rescheduleForm.newDate}
                      onChange={(e) => setRescheduleForm(prev => ({ ...prev, newDate: e.target.value }))}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newTime">New Time</Label>
                    <Select value={rescheduleForm.newTime} onValueChange={(value) => setRescheduleForm(prev => ({ ...prev, newTime: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time, index) => (
                          <SelectItem key={`reschedule-time-${time}-${index}`} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for rescheduling (optional)</Label>
                    <Input
                      id="reason"
                      value={rescheduleForm.reason}
                      onChange={(e) => setRescheduleForm(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Brief reason..."
                    />
                  </div>
                </div>

                <div className="flex space-x-2 justify-end">
                  <Button variant="outline" onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRescheduleAppointment}
                    disabled={!rescheduleForm.newDate || !rescheduleForm.newTime}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Reschedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}