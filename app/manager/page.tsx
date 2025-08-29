"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Building2, Calendar, AlertTriangle, Edit, Plus, Users, Activity, TrendingUp, Clock, Settings, MapPin, Phone, Mail, Star, BarChart3 } from "lucide-react"
import { appointmentAPI, scheduleAPI, reportAPI, clinicAPI } from "@/lib/api"

export default function ManagerDashboard() {
  const [userRole, setUserRole] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [selectedClinic, setSelectedClinic] = useState("clinic1")
  const [activeTab, setActiveTab] = useState("overview")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddClinicModalOpen, setIsAddClinicModalOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    const email = localStorage.getItem("userEmail")

    if (!role || role !== "manager") {
      router.push("/")
      return
    }

    setUserRole(role)
    setUserEmail(email || "")
    
    // Load real data
    loadClinicsData()
    loadAppointmentsData()
    loadDoctorSchedules()
  }, [router])

  const loadClinicsData = async () => {
    try {
      const response = await clinicAPI.getClinics()
      if (response.success && response.data) {
        setClinics(response.data)
      }
    } catch (error) {
      console.error('Failed to load clinics data:', error)
    }
  }

  const loadAppointmentsData = async () => {
    try {
      const response = await appointmentAPI.getAppointments()
      if (response.success && response.data) {
        // Group appointments by clinic
        const appointmentsByClinic = response.data.reduce((acc: any, appointment: any) => {
          const clinicId = appointment.ma_phong_kham || 'unknown'
          if (!acc[clinicId]) acc[clinicId] = []
          acc[clinicId].push(appointment)
          return acc
        }, {})
        setTodayAppointments(appointmentsByClinic)
      }
    } catch (error) {
      console.error('Failed to load appointments data:', error)
    }
  }

  const loadDoctorSchedules = async () => {
    try {
      const response = await scheduleAPI.getSchedules()
      if (response.success && response.data) {
        const formattedSchedules = response.data.map((schedule: any) => ({
          id: schedule.ma_lich_lam_viec,
          doctor: schedule.ten_bac_si || 'Unknown Doctor',
          specialty: schedule.chuyen_khoa || 'General',
          monday: schedule.thu_hai || '',
          tuesday: schedule.thu_ba || '',
          wednesday: schedule.thu_tu || '',
          thursday: schedule.thu_nam || '',
          friday: schedule.thu_sau || '',
          autoAssigned: true,
          conflicts: false,
          totalPatients: schedule.so_benh_nhan || 0,
          avgRating: schedule.danh_gia || 4.5,
          workHours: `${schedule.gio_bat_dau} - ${schedule.gio_ket_thuc}`
        }))
        setDoctorSchedules(formattedSchedules)
      }
    } catch (error) {
      console.error('Failed to load doctor schedules:', error)
    }
  }

  const [clinics, setClinics] = useState([
    { 
      id: "clinic1", 
      name: "Downtown Clinic", 
      address: "123 Main St, Downtown", 
      phone: "(555) 123-4567", 
      email: "downtown@clinic.com",
      manager: "Dr. Sarah Johnson",
      capacity: 50,
      status: "Active",
      rating: 4.8,
      totalPatients: 1250,
      todayAppointments: 23,
      revenue: 125000
    },
    { 
      id: "clinic2", 
      name: "Westside Clinic", 
      address: "456 Oak Ave, Westside", 
      phone: "(555) 234-5678", 
      email: "westside@clinic.com",
      manager: "Dr. Michael Chen",
      capacity: 40,
      status: "Active",
      rating: 4.6,
      totalPatients: 980,
      todayAppointments: 18,
      revenue: 98000
    },
    { 
      id: "clinic3", 
      name: "Eastside Clinic", 
      address: "789 Pine St, Eastside", 
      phone: "(555) 345-6789", 
      email: "eastside@clinic.com",
      manager: "Dr. Emily Rodriguez",
      capacity: 35,
      status: "Under Renovation",
      rating: 4.4,
      totalPatients: 750,
      todayAppointments: 0,
      revenue: 65000
    }
  ])

  const [todayAppointments, setTodayAppointments] = useState({
    clinic1: [
      { id: 1, time: "09:00", doctor: "Dr. Smith", patient: "John Doe", status: "confirmed", type: "Consultation" },
      { id: 2, time: "10:00", doctor: "Dr. Johnson", patient: "Mary Wilson", status: "confirmed", type: "Follow-up" },
      { id: 3, time: "11:00", doctor: "Dr. Smith", patient: "David Brown", status: "pending", type: "Consultation" },
      { id: 4, time: "14:00", doctor: "Dr. Williams", patient: "Sarah Davis", status: "confirmed", type: "Surgery" },
      { id: 5, time: "15:00", doctor: "Dr. Johnson", patient: "Mike Garcia", status: "cancelled", type: "Consultation" },
    ],
    clinic2: [
      { id: 6, time: "09:30", doctor: "Dr. Chen", patient: "Anna Lee", status: "confirmed", type: "Consultation" },
      { id: 7, time: "11:00", doctor: "Dr. Brown", patient: "Tom Wilson", status: "confirmed", type: "Check-up" },
    ],
    clinic3: []
  })

  const [doctorSchedules, setDoctorSchedules] = useState([
    {
      id: "doc1",
      doctor: "Dr. Smith",
      specialty: "Cardiology",
      monday: "Downtown",
      tuesday: "Westside",
      wednesday: "Downtown",
      thursday: "Eastside",
      friday: "Downtown",
      autoAssigned: true,
      conflicts: false,
      totalPatients: 45,
      avgRating: 4.9,
      workHours: "9:00 AM - 5:00 PM"
    },
    {
      id: "doc2",
      doctor: "Dr. Johnson",
      specialty: "Pediatrics",
      monday: "Westside",
      tuesday: "Downtown",
      wednesday: "Westside",
      thursday: "Westside",
      friday: "Downtown",
      autoAssigned: true,
      conflicts: true,
      totalPatients: 38,
      avgRating: 4.7,
      workHours: "8:00 AM - 4:00 PM"
    },
    {
      id: "doc3",
      doctor: "Dr. Williams",
      specialty: "Orthopedics",
      monday: "Eastside",
      tuesday: "Downtown",
      wednesday: "Downtown",
      thursday: "Downtown",
      friday: "Eastside",
      autoAssigned: false,
      conflicts: false,
      totalPatients: 52,
      avgRating: 4.8,
      workHours: "10:00 AM - 6:00 PM"
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "Active":
        return "bg-green-100 text-green-800"
      case "Under Renovation":
        return "bg-orange-100 text-orange-800"
      case "Closed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleEditDoctor = (doctor: any) => {
    setSelectedDoctor(doctor)
    setIsEditModalOpen(true)
  }

  const handleSaveDoctor = () => {
    if (selectedDoctor) {
      setDoctorSchedules(prev => prev.map(doc => 
        doc.id === selectedDoctor.id ? selectedDoctor : doc
      ))
      setIsEditModalOpen(false)
      setSuccessMessage("Doctor schedule updated successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
    }
  }

  const handleAddClinic = (clinicData: any) => {
    const newClinic = {
      ...clinicData,
      id: `clinic${clinics.length + 1}`,
      status: "Active",
      rating: 0,
      totalPatients: 0,
      todayAppointments: 0,
      revenue: 0
    }
    setClinics([...clinics, newClinic])
    setIsAddClinicModalOpen(false)
    setSuccessMessage("New clinic added successfully!")
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const totalPatients = clinics.reduce((sum, clinic) => sum + clinic.totalPatients, 0)
  const totalRevenue = clinics.reduce((sum, clinic) => sum + clinic.revenue, 0)
  const avgRating = clinics.length > 0 ? (clinics.reduce((sum, clinic) => sum + clinic.rating, 0) / clinics.length).toFixed(1) : "0"
  const activeClinics = clinics.filter(clinic => clinic.status === "Active").length

  const selectedClinicName = clinics.find((c) => c.id === selectedClinic)?.name || "Unknown Clinic"
  const appointments = todayAppointments[selectedClinic as keyof typeof todayAppointments] || []

  if (!userRole) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={userRole} userEmail={userEmail} />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="text-gray-600">Manage clinics, schedules, and operations</p>
        </div>

        {successMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        {errorMessage && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="clinics">Clinics</TabsTrigger>
            <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overview Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{activeClinics}</p>
                      <p className="text-sm text-gray-600">Active Clinics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Users className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">{totalPatients.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Total Patients</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Star className="h-8 w-8 text-yellow-600" />
                    <div>
                      <p className="text-2xl font-bold">{avgRating}</p>
                      <p className="text-sm text-gray-600">Avg Rating</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Appointments */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span>Today's Schedule</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Clinic</label>
                    <Select value={selectedClinic} onValueChange={setSelectedClinic}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {clinics.map((clinic) => (
                          <SelectItem key={clinic.id} value={clinic.id}>
                            {clinic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Today's Appointments - {selectedClinicName}</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {appointments.length > 0 ? (
                        appointments.map((appointment) => (
                          <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="text-sm font-medium">{appointment.time}</div>
                              <div>
                                <div className="font-medium">{appointment.doctor}</div>
                                <div className="text-sm text-gray-600">{appointment.patient}</div>
                                <div className="text-xs text-blue-600">{appointment.type}</div>
                              </div>
                            </div>
                            <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No appointments scheduled for this clinic today
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    <span>System Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{doctorSchedules.length}</div>
                      <div className="text-sm text-blue-800">Active Doctors</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {Object.values(todayAppointments).flat().filter(app => app.status === 'confirmed').length}
                      </div>
                      <div className="text-sm text-green-800">Today's Confirmed</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {doctorSchedules.filter(doc => doc.conflicts).length}
                      </div>
                      <div className="text-sm text-yellow-800">Schedule Conflicts</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round(doctorSchedules.reduce((sum, doc) => sum + doc.avgRating, 0) / doctorSchedules.length * 10) / 10}
                      </div>
                      <div className="text-sm text-purple-800">Avg Doctor Rating</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="clinics" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Clinic Management</h2>
              <Dialog open={isAddClinicModalOpen} onOpenChange={setIsAddClinicModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Clinic
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Clinic</DialogTitle>
                  </DialogHeader>
                  <AddClinicForm onSubmit={handleAddClinic} />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clinics.map((clinic) => (
                <Card key={clinic.id} className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{clinic.name}</span>
                      <Badge className={getStatusColor(clinic.status)}>{clinic.status}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{clinic.address}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{clinic.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{clinic.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>Manager: {clinic.manager}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{clinic.rating}/5 ({clinic.totalPatients} patients)</span>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Capacity:</span>
                          <span className="ml-1 font-medium">{clinic.capacity}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Today:</span>
                          <span className="ml-1 font-medium">{clinic.todayAppointments}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="scheduling" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <span>Doctor Scheduling</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Specialty</TableHead>
                        <TableHead>Mon</TableHead>
                        <TableHead>Tue</TableHead>
                        <TableHead>Wed</TableHead>
                        <TableHead>Thu</TableHead>
                        <TableHead>Fri</TableHead>
                        <TableHead>Patients</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {doctorSchedules.map((schedule) => (
                        <TableRow key={schedule.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-2">
                              <span>{schedule.doctor}</span>
                              {schedule.conflicts && <AlertTriangle className="h-4 w-4 text-red-500" />}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {schedule.specialty}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">{schedule.monday}</TableCell>
                          <TableCell className="text-xs">{schedule.tuesday}</TableCell>
                          <TableCell className="text-xs">{schedule.wednesday}</TableCell>
                          <TableCell className="text-xs">{schedule.thursday}</TableCell>
                          <TableCell className="text-xs">{schedule.friday}</TableCell>
                          <TableCell className="text-sm">{schedule.totalPatients}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span className="text-sm">{schedule.avgRating}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditDoctor(schedule)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {doctorSchedules.some((s) => s.conflicts) && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-red-800">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Scheduling conflicts detected. Please review and adjust assignments.
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <span>Performance Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {clinics.map((clinic) => (
                    <div key={clinic.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{clinic.name}</span>
                        <span className="text-sm text-gray-600">${clinic.revenue.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(clinic.revenue / Math.max(...clinics.map(c => c.revenue))) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{clinic.totalPatients} patients</span>
                        <span>Rating: {clinic.rating}/5</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span>Monthly Trends</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    📊 Analytics charts and trends will be implemented with real data integration
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Doctor Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Doctor Schedule</DialogTitle>
            </DialogHeader>
            {selectedDoctor && (
              <div className="space-y-4">
                <div>
                  <Label>Doctor: {selectedDoctor.doctor}</Label>
                  <p className="text-sm text-gray-600">Specialty: {selectedDoctor.specialty}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="monday">Monday</Label>
                    <Select 
                      value={selectedDoctor.monday} 
                      onValueChange={(value) => setSelectedDoctor({...selectedDoctor, monday: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {clinics.map((clinic) => (
                          <SelectItem key={clinic.id} value={clinic.name.split(' ')[0]}>
                            {clinic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="tuesday">Tuesday</Label>
                    <Select 
                      value={selectedDoctor.tuesday} 
                      onValueChange={(value) => setSelectedDoctor({...selectedDoctor, tuesday: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {clinics.map((clinic) => (
                          <SelectItem key={clinic.id} value={clinic.name.split(' ')[0]}>
                            {clinic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="workHours">Work Hours</Label>
                  <Input
                    value={selectedDoctor.workHours}
                    onChange={(e) => setSelectedDoctor({...selectedDoctor, workHours: e.target.value})}
                    placeholder="e.g., 9:00 AM - 5:00 PM"
                  />
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <Button onClick={handleSaveDoctor} className="flex-1">
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

// Add Clinic Form Component
function AddClinicForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    manager: '',
    capacity: 30
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({ name: '', address: '', phone: '', email: '', manager: '', capacity: 30 })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Clinic Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="manager">Manager</Label>
        <Input
          id="manager"
          value={formData.manager}
          onChange={(e) => setFormData({...formData, manager: e.target.value})}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="capacity">Capacity</Label>
        <Input
          id="capacity"
          type="number"
          value={formData.capacity}
          onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
          min="10"
          max="100"
          required
        />
      </div>
      
      <div className="flex space-x-2 pt-4">
        <Button type="submit" className="flex-1">
          Add Clinic
        </Button>
        <Button type="button" variant="outline" className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  )
}
