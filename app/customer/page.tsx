"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Download, User, FileText } from "lucide-react"

export default function CustomerDashboard() {
  const [userRole, setUserRole] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
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
  }, [router])

  const doctors = [
    { id: "1", name: "Dr. Smith", specialty: "Pediatrics" },
    { id: "2", name: "Dr. Johnson", specialty: "Family Medicine" },
    { id: "3", name: "Dr. Williams", specialty: "Dermatology" },
  ]

  const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]

  const medicalHistory = [
    {
      id: "1",
      date: "2024-01-15",
      doctor: "Dr. Smith",
      diagnosis: "Common Cold",
      prescription: "Rest, fluids, acetaminophen",
      notes: "Follow up if symptoms persist",
    },
    {
      id: "2",
      date: "2024-01-02",
      doctor: "Dr. Johnson",
      diagnosis: "Routine Checkup",
      prescription: "Vitamins",
      notes: "Healthy development, next checkup in 6 months",
    },
  ]

  const handleBookAppointment = () => {
    if (selectedDoctor && selectedDate && selectedTime) {
      alert("Appointment booked successfully! SMS and email confirmation sent.")
      setSelectedDoctor("")
      setSelectedDate("")
      setSelectedTime("")
    } else {
      alert("Please fill in all fields")
    }
  }

  if (!userRole) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={userRole} userEmail={userEmail} />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Book Appointment Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>Book Appointment</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doctor">Select Doctor</Label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.specialty}
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
                    <SelectValue placeholder="Choose a time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleBookAppointment} className="w-full bg-blue-600 hover:bg-blue-700">
                Book Appointment
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
                {medicalHistory.map((record) => (
                  <Card key={record.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{record.date}</span>
                          <User className="h-4 w-4 ml-2" />
                          <span>{record.doctor}</span>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs bg-transparent">
                          <Download className="h-3 w-3 mr-1" />
                          PDF
                        </Button>
                      </div>
                      <div className="space-y-1">
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
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                <p>🔒 Your medical data is protected under HIPAA-compliant privacy standards.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
