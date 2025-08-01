"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Search, FileText, AlertTriangle, Plus } from "lucide-react"

export default function DoctorDashboard() {
  const [userRole, setUserRole] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
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
  }, [router])

  const todaySchedule = [
    { time: "09:00", patient: "John Smith", type: "Checkup", status: "confirmed" },
    { time: "10:00", patient: "Mary Johnson", type: "Follow-up", status: "confirmed" },
    { time: "11:00", patient: "David Wilson", type: "Consultation", status: "pending" },
    { time: "14:00", patient: "Sarah Brown", type: "Treatment", status: "confirmed" },
    { time: "15:00", patient: "Mike Davis", type: "Emergency", status: "urgent" },
    { time: "16:00", patient: "Lisa Garcia", type: "Checkup", status: "confirmed" },
  ]

  const patientRecords = [
    {
      id: "P001",
      name: "John Smith",
      lastVisit: "2024-01-15",
      diagnosis: "Hypertension (I10)",
      prescription: "Lisinopril 10mg daily",
      notes: "Blood pressure controlled, continue medication",
    },
    {
      id: "P002",
      name: "Mary Johnson",
      lastVisit: "2024-01-12",
      diagnosis: "Type 2 Diabetes (E11.9)",
      prescription: "Metformin 500mg twice daily",
      notes: "HbA1c improved, dietary counseling provided",
    },
    {
      id: "P003",
      name: "David Wilson",
      lastVisit: "2024-01-10",
      diagnosis: "Acute Bronchitis (J20.9)",
      prescription: "Albuterol inhaler as needed",
      notes: "Symptoms resolving, follow up in 1 week",
    },
  ]

  const filteredRecords = patientRecords.filter(
    (record) =>
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "urgent":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const hasConflicts = todaySchedule.some((apt) => apt.status === "urgent")

  if (!userRole) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={userRole} userEmail={userEmail} />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
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
                {todaySchedule.map((appointment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-medium text-gray-900">{appointment.time}</div>
                      <div>
                        <div className="font-medium">{appointment.patient}</div>
                        <div className="text-sm text-gray-600">{appointment.type}</div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                  </div>
                ))}
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
                {filteredRecords.map((record) => (
                  <Card key={record.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">{record.name}</div>
                          <div className="text-sm text-gray-600">ID: {record.id}</div>
                        </div>
                        <div className="text-sm text-gray-500">Last visit: {record.lastVisit}</div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>Diagnosis:</strong> {record.diagnosis}
                        </p>
                        <p>
                          <strong>Prescription:</strong> {record.prescription}
                        </p>
                        <p>
                          <strong>Notes:</strong> {record.notes}
                        </p>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <Button size="sm" variant="outline">
                          View Full Record
                        </Button>
                        <Button size="sm" variant="outline">
                          Add Visit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
