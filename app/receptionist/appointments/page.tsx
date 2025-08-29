"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Calendar, Clock, User, Edit, Check, X, Eye, Filter } from "lucide-react"
import { appointmentAPI, clinicAPI } from "@/lib/api"

export default function ReceptionistAppointmentsPage() {
  const [userRole, setUserRole] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [appointments, setAppointments] = useState<any[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedDoctor, setSelectedDoctor] = useState("all")
  const [selectedClinic, setSelectedClinic] = useState("all")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  
  // Data for dropdowns
  const [doctors, setDoctors] = useState<any[]>([])
  const [clinics, setClinics] = useState<any[]>([])
  
  // Edit appointment modal state
  const [editingAppointment, setEditingAppointment] = useState<any>(null)
  const [editForm, setEditForm] = useState({
    ngay_gio_kham: "",
    trang_thai: "",
    ghi_chu: ""
  })

  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    const email = localStorage.getItem("userEmail")

    if (!role || role !== "receptionist") {
      router.push("/")
      return
    }

    setUserRole(role)
    setUserEmail(email || "")
    
    loadAppointments()
    loadClinics()
    loadAllDoctors()
  }, [router])

  const loadAppointments = async () => {
    setIsLoading(true)
    setError("")
    try {
      const response = await appointmentAPI.getAppointments()
      if (response.success && response.data) {
        setAppointments(response.data)
        setFilteredAppointments(response.data)
      } else {
        setError("Failed to load appointments")
      }
    } catch (error) {
      console.error("Failed to load appointments:", error)
      setError("Failed to load appointments")
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

  const loadAllDoctors = async () => {
    try {
      // Load doctors from all clinics - this is a simplified approach
      // In practice, you might have a dedicated API for this
      const response = await clinicAPI.getClinics()
      if (response.success && response.data) {
        const allDoctors: any[] = []
        for (const clinic of response.data) {
          try {
            const doctorsResponse = await clinicAPI.getDoctors(clinic.ma_phong_kham)
            if (doctorsResponse.success && doctorsResponse.data) {
              const clinicDoctors = typeof doctorsResponse.data === 'object' && 'all_doctors' in doctorsResponse.data
                ? doctorsResponse.data.all_doctors
                : doctorsResponse.data
              allDoctors.push(...clinicDoctors)
            }
          } catch (error) {
            console.log(`Failed to load doctors for clinic ${clinic.ma_phong_kham}`)
          }
        }
        
        // Remove duplicates based on doctor ID
        const uniqueDoctors = allDoctors.filter((doctor, index, self) => 
          index === self.findIndex(d => (d.userID || d.ma_user) === (doctor.userID || doctor.ma_user))
        )
        setDoctors(uniqueDoctors)
      }
    } catch (error) {
      console.error("Failed to load doctors:", error)
    }
  }

  // Filter appointments based on search and filters
  useEffect(() => {
    let filtered = appointments

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(apt => 
        (apt.ten_khach_hang && apt.ten_khach_hang.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (apt.ten_bac_si && apt.ten_bac_si.toLowerCase().includes(searchTerm.toLowerCase())) ||
        apt.ma_lich_kham.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Date filter
    if (selectedDate) {
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.ngay_gio_kham).toDateString()
        const filterDate = new Date(selectedDate).toDateString()
        return aptDate === filterDate
      })
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter(apt => apt.trang_thai === selectedStatus)
    }

    // Doctor filter
    if (selectedDoctor !== "all") {
      filtered = filtered.filter(apt => apt.ma_bac_si === selectedDoctor)
    }

    // Clinic filter
    if (selectedClinic !== "all") {
      filtered = filtered.filter(apt => apt.ma_phong_kham === selectedClinic)
    }

    setFilteredAppointments(filtered)
  }, [appointments, searchTerm, selectedDate, selectedStatus, selectedDoctor, selectedClinic])

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      const response = await appointmentAPI.updateAppointment(appointmentId, {
        trang_thai: "CONFIRMED"
      })

      if (response.success) {
        setMessage("Appointment confirmed successfully!")
        loadAppointments()
      } else {
        setError("Failed to confirm appointment")
      }
    } catch (error) {
      console.error("Failed to confirm appointment:", error)
      setError("Failed to confirm appointment")
    }
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        const response = await appointmentAPI.updateAppointment(appointmentId, {
          trang_thai: "CANCELLED"
        })

        if (response.success) {
          setMessage("Appointment cancelled successfully!")
          loadAppointments()
        } else {
          setError("Failed to cancel appointment")
        }
      } catch (error) {
        console.error("Failed to cancel appointment:", error)
        setError("Failed to cancel appointment")
      }
    }
  }

  const handleEditAppointment = (appointment: any) => {
    setEditingAppointment(appointment)
    setEditForm({
      ngay_gio_kham: new Date(appointment.ngay_gio_kham).toISOString().slice(0, 16),
      trang_thai: appointment.trang_thai,
      ghi_chu: appointment.ghi_chu || ""
    })
  }

  const handleSaveEdit = async () => {
    if (!editingAppointment) return

    try {
      const response = await appointmentAPI.updateAppointment(editingAppointment.ma_lich_kham, {
        ngay_gio_kham: editForm.ngay_gio_kham,
        trang_thai: editForm.trang_thai,
        ghi_chu: editForm.ghi_chu
      })

      if (response.success) {
        setMessage("Appointment updated successfully!")
        setEditingAppointment(null)
        loadAppointments()
      } else {
        setError("Failed to update appointment")
      }
    } catch (error) {
      console.error("Failed to update appointment:", error)
      setError("Failed to update appointment")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800"
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800"
      case "COMPLETED":
        return "bg-purple-100 text-purple-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      case "NO_SHOW":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedDate("")
    setSelectedStatus("all")
    setSelectedDoctor("all")
    setSelectedClinic("all")
  }

  if (!userRole) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={userRole} userEmail={userEmail} />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointment Management</h1>
          <p className="text-gray-600">View, confirm, and manage patient appointments</p>
        </div>

        {message && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-blue-600" />
              <span>Filter Appointments</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder="Filter by date"
              />
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="NO_SHOW">No Show</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger>
                  <SelectValue placeholder="All Doctors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.userID || doctor.ma_user} value={doctor.userID || doctor.ma_user}>
                      {doctor.hoTen || doctor.ho_ten}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedClinic} onValueChange={setSelectedClinic}>
                <SelectTrigger>
                  <SelectValue placeholder="All Clinics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clinics</SelectItem>
                  {clinics.map((clinic) => (
                    <SelectItem key={clinic.ma_phong_kham} value={clinic.ma_phong_kham}>
                      {clinic.ten_phong_kham}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <Button onClick={loadAppointments} variant="outline" className="flex-1">
                  Refresh
                </Button>
                <Button onClick={clearFilters} variant="outline" className="flex-1">
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>Appointments ({filteredAppointments.length})</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading appointments...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Clinic</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppointments.length > 0 ? (
                      filteredAppointments.map((appointment) => {
                        const { date, time } = formatDateTime(appointment.ngay_gio_kham)
                        return (
                          <TableRow key={appointment.ma_lich_kham}>
                            <TableCell className="font-medium">{appointment.ma_lich_kham}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{appointment.ten_khach_hang || "Unknown"}</div>
                                <div className="text-sm text-gray-500">ID: {appointment.ma_customer}</div>
                              </div>
                            </TableCell>
                            <TableCell>{appointment.ten_bac_si || "Unknown"}</TableCell>
                            <TableCell>{date}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span>{time}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(appointment.trang_thai)}>
                                {appointment.trang_thai}
                              </Badge>
                            </TableCell>
                            <TableCell>{appointment.ten_phong_kham || "Unknown"}</TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditAppointment(appointment)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                {appointment.trang_thai === "SCHEDULED" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600 hover:text-green-700"
                                    onClick={() => handleConfirmAppointment(appointment.ma_lich_kham)}
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                )}
                                {["SCHEDULED", "CONFIRMED"].includes(appointment.trang_thai) && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => handleCancelAppointment(appointment.ma_lich_kham)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          {searchTerm || selectedDate || selectedStatus !== "all" || selectedDoctor !== "all" || selectedClinic !== "all"
                            ? "No appointments match your filters"
                            : "No appointments found"
                          }
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Appointment Modal */}
        {editingAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Edit className="h-5 w-5 text-blue-600" />
                  <span>Edit Appointment</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit_date">Date & Time</Label>
                    <Input
                      id="edit_date"
                      type="datetime-local"
                      value={editForm.ngay_gio_kham}
                      onChange={(e) => setEditForm(prev => ({ ...prev, ngay_gio_kham: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit_status">Status</Label>
                    <Select value={editForm.trang_thai} onValueChange={(value) => setEditForm(prev => ({ ...prev, trang_thai: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        <SelectItem value="NO_SHOW">No Show</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit_notes">Notes</Label>
                    <Input
                      id="edit_notes"
                      value={editForm.ghi_chu}
                      onChange={(e) => setEditForm(prev => ({ ...prev, ghi_chu: e.target.value }))}
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-6">
                  <Button variant="outline" onClick={() => setEditingAppointment(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit} className="bg-blue-600 hover:bg-blue-700">
                    Save Changes
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