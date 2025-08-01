"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Building2, Calendar, AlertTriangle, Edit } from "lucide-react"

export default function ManagerDashboard() {
  const [userRole, setUserRole] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [selectedClinic, setSelectedClinic] = useState("clinic1")
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
  }, [router])

  const clinics = [
    { id: "clinic1", name: "Downtown Clinic" },
    { id: "clinic2", name: "Westside Clinic" },
    { id: "clinic3", name: "Eastside Clinic" },
    { id: "clinic4", name: "Northside Clinic" },
    { id: "clinic5", name: "Southside Clinic" },
  ]

  const todayAppointments = {
    clinic1: [
      { time: "09:00", doctor: "Dr. Smith", patient: "John Doe", status: "confirmed" },
      { time: "10:00", doctor: "Dr. Johnson", patient: "Mary Wilson", status: "confirmed" },
      { time: "11:00", doctor: "Dr. Smith", patient: "David Brown", status: "pending" },
      { time: "14:00", doctor: "Dr. Williams", patient: "Sarah Davis", status: "confirmed" },
      { time: "15:00", doctor: "Dr. Johnson", patient: "Mike Garcia", status: "cancelled" },
    ],
  }

  const doctorSchedules = [
    {
      doctor: "Dr. Smith",
      monday: "Downtown",
      tuesday: "Westside",
      wednesday: "Downtown",
      thursday: "Eastside",
      friday: "Downtown",
      autoAssigned: true,
      conflicts: false,
    },
    {
      doctor: "Dr. Johnson",
      monday: "Westside",
      tuesday: "Downtown",
      wednesday: "Northside",
      thursday: "Westside",
      friday: "Southside",
      autoAssigned: true,
      conflicts: true,
    },
    {
      doctor: "Dr. Williams",
      monday: "Eastside",
      tuesday: "Northside",
      wednesday: "Southside",
      thursday: "Downtown",
      friday: "Eastside",
      autoAssigned: false,
      conflicts: false,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const selectedClinicName = clinics.find((c) => c.id === selectedClinic)?.name || "Unknown Clinic"
  const appointments = todayAppointments[selectedClinic as keyof typeof todayAppointments] || []

  if (!userRole) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={userRole} userEmail={userEmail} />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Clinic Operations Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <span>Clinic Operations</span>
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
                <div className="space-y-2">
                  {appointments.length > 0 ? (
                    appointments.map((appointment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="text-sm font-medium">{appointment.time}</div>
                          <div>
                            <div className="font-medium">{appointment.doctor}</div>
                            <div className="text-sm text-gray-600">{appointment.patient}</div>
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

          {/* Doctor Scheduling Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <span>Doctor Scheduling</span>
                </div>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Schedule
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Mon</TableHead>
                      <TableHead>Tue</TableHead>
                      <TableHead>Wed</TableHead>
                      <TableHead>Thu</TableHead>
                      <TableHead>Fri</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doctorSchedules.map((schedule) => (
                      <TableRow key={schedule.doctor}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <span>{schedule.doctor}</span>
                            {schedule.conflicts && <AlertTriangle className="h-4 w-4 text-red-500" />}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{schedule.monday}</TableCell>
                        <TableCell className="text-xs">{schedule.tuesday}</TableCell>
                        <TableCell className="text-xs">{schedule.wednesday}</TableCell>
                        <TableCell className="text-xs">{schedule.thursday}</TableCell>
                        <TableCell className="text-xs">{schedule.friday}</TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <Badge variant={schedule.autoAssigned ? "default" : "secondary"} className="text-xs">
                              {schedule.autoAssigned ? "Auto" : "Manual"}
                            </Badge>
                            {schedule.conflicts && (
                              <Badge variant="destructive" className="text-xs">
                                Conflict
                              </Badge>
                            )}
                          </div>
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

              <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <p>
                  💡 <strong>Auto-assignment:</strong> System automatically distributes doctors across clinics based on
                  patient load and availability.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
