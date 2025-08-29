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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, UserPlus, Calendar, Users, Edit } from "lucide-react"
import { customerAPI, clinicAPI, appointmentAPI } from "@/lib/api"
import { CustomerModal } from "@/components/customer-modal"

export default function ReceptionistDashboard() {
  const [userRole, setUserRole] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [selectedClinic, setSelectedClinic] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const [customers, setCustomers] = useState<any[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, total_pages: 0 })
  const [clinics, setClinics] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [specialties, setSpecialties] = useState<string[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [receptionistClinic, setReceptionistClinic] = useState<string>("")
  
  // Modal state
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [selectedCustomerForEdit, setSelectedCustomerForEdit] = useState<any>(null)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  
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
    
    // Load initial data
    loadCustomers()
    loadClinics()
    loadSpecialties()
    
    // Set receptionist's clinic - this should come from user profile
    // For now, we'll use a default clinic or get from user profile
    setReceptionistClinic("PK001") // This should be dynamic based on receptionist's profile
  }, [router])

  const loadCustomers = async (search?: string, page: number = 1) => {
    setIsLoading(true)
    try {
      const response = await customerAPI.getCustomers({ search, page, limit: 20 })
      if (response.success && response.data) {
        // Check if response has the new pagination structure
        if (response.data.customers && response.data.pagination) {
          setCustomers(response.data.customers || [])
          setPagination(response.data.pagination)
        } else {
          // Fallback for old API format
          setCustomers(Array.isArray(response.data) ? response.data : [])
          setPagination({ page: 1, limit: 20, total: Array.isArray(response.data) ? response.data.length : 0, total_pages: 1 })
        }
      } else {
        setCustomers([])
        setPagination({ page: 1, limit: 20, total: 0, total_pages: 0 })
      }
    } catch (error) {
      console.error("Failed to load customers:", error)
      setMessage("Failed to load customers")
      setCustomers([])
      setPagination({ page: 1, limit: 20, total: 0, total_pages: 0 })
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

  const loadDoctors = async (clinicId: string, specialty?: string) => {
    if (!clinicId) return
    try {
      const response = await clinicAPI.getDoctors(clinicId, specialty)
      if (response.success && response.data) {
        if (typeof response.data === 'object' && 'all_doctors' in response.data) {
          setDoctors(response.data.all_doctors)
        } else {
          setDoctors(response.data)
        }
      }
    } catch (error) {
      console.error("Failed to load doctors:", error)
    }
  }

  const loadAvailableSlots = async (clinicId: string, doctorId: string, date: string) => {
    try {
      const response = await clinicAPI.getSchedules(clinicId, doctorId, date)
      if (response.success && response.data) {
        setAvailableSlots(response.data.available_slots || [])
      }
    } catch (error) {
      console.error("Failed to load available slots:", error)
    }
  }



  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadCustomers(searchTerm, 1)
  }

  const handlePageChange = (newPage: number) => {
    loadCustomers(searchTerm, newPage)
  }

  const handleBookAppointment = async () => {
    if (!selectedCustomer || !selectedDoctor || !selectedDate || !selectedTime || !receptionistClinic) {
      setMessage("Please fill in all fields")
      return
    }

    setIsLoading(true)
    try {
      const appointmentDateTime = `${selectedDate}T${selectedTime}:00`
      
      const response = await appointmentAPI.createAppointment({
        ma_bac_si: selectedDoctor,
        ma_phong_kham: receptionistClinic,
        ngay_gio_kham: appointmentDateTime,
        ghi_chu: `Booked by receptionist for customer ${selectedCustomer}`,
      })

      if (response.success) {
        setMessage("Appointment booked successfully!")
        setSelectedCustomer("")
        setSelectedDoctor("")
        setSelectedDate("")
        setSelectedTime("")
        setSelectedSpecialty("all")
        setAvailableSlots([])
      } else {
        setMessage(response.message || "Failed to book appointment")
      }
    } catch (error) {
      console.error("Failed to book appointment:", error)
      setMessage("Failed to book appointment")
    } finally {
      setIsLoading(false)
    }
  }

  // Load doctors when specialty changes
  useEffect(() => {
    if (receptionistClinic) {
      const specialty = selectedSpecialty === "all" ? undefined : selectedSpecialty
      loadDoctors(receptionistClinic, specialty)
    }
  }, [receptionistClinic, selectedSpecialty])

  // Load time slots when doctor or date changes
  useEffect(() => {
    if (receptionistClinic && selectedDoctor && selectedDate) {
      loadAvailableSlots(receptionistClinic, selectedDoctor, selectedDate)
    } else {
      setAvailableSlots([])
    }
  }, [receptionistClinic, selectedDoctor, selectedDate])

  // Modal handlers
  const handleCreateCustomer = () => {
    setModalMode("create")
    setSelectedCustomerForEdit(null)
    setIsCustomerModalOpen(true)
  }

  const handleEditCustomer = (customer: any) => {
    setModalMode("edit")
    setSelectedCustomerForEdit(customer)
    setIsCustomerModalOpen(true)
  }

  const handleModalSave = () => {
    // Refresh customer list
    loadCustomers()
    setMessage("Customer saved successfully!")
    setTimeout(() => setMessage(""), 3000)
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
                <Button onClick={() => router.push("/receptionist/payments")} variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Payment Management
                </Button>
                <Button onClick={() => router.push("/receptionist/appointments")} variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Appointment Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Patient Management Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Manage Customer Profiles</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search customers by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearchSubmit(e)
                      }
                    }}
                    className="pl-10"
                  />
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateCustomer}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Customer
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow>
                        <TableHead>Customer ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Registration Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            Loading customers...
                          </TableCell>
                        </TableRow>
                      ) : customers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            No customers found
                          </TableCell>
                        </TableRow>
                      ) : (
                        customers.map((customer) => (
                          <TableRow key={customer.user_id}>
                            <TableCell className="font-medium">{customer.user_id}</TableCell>
                            <TableCell>{customer.ho_ten}</TableCell>
                            <TableCell>{customer.so_dien_thoai}</TableCell>
                            <TableCell>{customer.ngay_dang_ky?.split('T')[0]}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline" onClick={() => handleEditCustomer(customer)}>
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination Controls */}
                {pagination.total_pages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                      >
                        Previous
                      </Button>
                      
                      <div className="flex items-center space-x-1">
                        {(() => {
                          let pagesToShow = [];
                          if (pagination.total_pages <= 5) {
                            pagesToShow = Array.from({ length: pagination.total_pages }, (_, i) => i + 1);
                          } else if (pagination.page <= 3) {
                            pagesToShow = [1, 2, 3, 4, 5];
                          } else if (pagination.page >= pagination.total_pages - 2) {
                            pagesToShow = Array.from({ length: 5 }, (_, i) => pagination.total_pages - 4 + i);
                          } else {
                            pagesToShow = Array.from({ length: 5 }, (_, i) => pagination.page - 2 + i);
                          }
                          
                          return pagesToShow.map(page => (
                            <Button
                              key={`page-${page}`}
                              variant={page === pagination.page ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </Button>
                          ));
                        })()}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.total_pages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Appointment Booking Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <span>Book Appointment</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {message && (
                <Alert className="mb-4">
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Select Customer</Label>
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.user_id} value={customer.user_id}>
                          {customer.ho_ten} ({customer.user_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialty">Medical Specialty</Label>
                  <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                    <SelectTrigger>
                      <SelectValue placeholder="All specialties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All specialties</SelectItem>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doctor">Select Doctor</Label>
                  <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.userID} value={doctor.userID}>
                          {doctor.hoTen}
                          {doctor.chuyenKhoa && ` - ${doctor.chuyenKhoa}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Appointment Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Available Time Slots</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose time" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSlots.length > 0 ? (
                        availableSlots.map((time, index) => (
                          <SelectItem key={`${selectedDoctor}-${selectedDate}-${index}-${time}`} value={time}>
                            {time}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          {selectedDoctor && selectedDate 
                            ? "No available slots" 
                            : "Select doctor and date first"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleBookAppointment} 
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
                disabled={isLoading || !selectedCustomer || !selectedDoctor || !selectedDate || !selectedTime}
              >
                {isLoading ? "Booking..." : "Book Appointment"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customer={selectedCustomerForEdit}
        onSave={handleModalSave}
        mode={modalMode}
      />
    </div>
  )
}
