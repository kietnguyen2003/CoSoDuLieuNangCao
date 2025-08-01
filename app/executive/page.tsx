"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, Download, TrendingUp, Users, DollarSign, Calendar } from "lucide-react"

export default function ExecutiveDashboard() {
  const [userRole, setUserRole] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [timePeriod, setTimePeriod] = useState("monthly")
  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    const email = localStorage.getItem("userEmail")

    if (!role || role !== "executive") {
      router.push("/")
      return
    }

    setUserRole(role)
    setUserEmail(email || "")
  }, [router])

  const performanceData = {
    weekly: {
      totalAppointments: 1250,
      totalRevenue: 125000,
      doctorUtilization: 85,
      patientSatisfaction: 4.6,
    },
    monthly: {
      totalAppointments: 5400,
      totalRevenue: 540000,
      doctorUtilization: 88,
      patientSatisfaction: 4.7,
    },
    quarterly: {
      totalAppointments: 16200,
      totalRevenue: 1620000,
      doctorUtilization: 87,
      patientSatisfaction: 4.6,
    },
  }

  const clinicPerformance = [
    { name: "Downtown Clinic", appointments: 1200, revenue: 120000, utilization: 92 },
    { name: "Westside Clinic", appointments: 1100, revenue: 110000, utilization: 89 },
    { name: "Eastside Clinic", appointments: 980, revenue: 98000, utilization: 85 },
    { name: "Northside Clinic", appointments: 1050, revenue: 105000, utilization: 87 },
    { name: "Southside Clinic", appointments: 1070, revenue: 107000, utilization: 88 },
  ]

  const currentData = performanceData[timePeriod as keyof typeof performanceData]

  const handleExportReport = () => {
    alert(`Exporting ${timePeriod} performance report as PDF...`)
  }

  if (!userRole) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={userRole} userEmail={userEmail} />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <span>Performance Reports</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">Report Period:</span>
                </div>
                <Select value={timePeriod} onValueChange={setTimePeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleExportReport} className="bg-purple-600 hover:bg-purple-700">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold text-blue-700">
                        {currentData.totalAppointments.toLocaleString()}
                      </div>
                      <div className="text-sm text-blue-600">Total Appointments</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold text-green-700">
                        ${currentData.totalRevenue.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-600">Total Revenue</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="text-2xl font-bold text-purple-700">{currentData.doctorUtilization}%</div>
                      <div className="text-sm text-purple-600">Doctor Utilization</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-yellow-600" />
                    <div>
                      <div className="text-2xl font-bold text-yellow-700">{currentData.patientSatisfaction}/5</div>
                      <div className="text-sm text-yellow-600">Patient Satisfaction</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Clinic Performance Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Clinic Performance Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clinicPerformance.map((clinic, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{clinic.name}</h3>
                        <div className="text-sm text-gray-600">Utilization: {clinic.utilization}%</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Appointments:</span>
                          <span className="ml-2 font-medium">{clinic.appointments.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Revenue:</span>
                          <span className="ml-2 font-medium">${clinic.revenue.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Utilization Bar */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${clinic.utilization}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Summary Insights */}
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">📊 Key Insights</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>• Downtown Clinic shows highest performance with 92% utilization</p>
                  <p>
                    • Overall doctor utilization at {currentData.doctorUtilization}% indicates efficient resource
                    allocation
                  </p>
                  <p>• Patient satisfaction remains consistently high at {currentData.patientSatisfaction}/5 stars</p>
                  <p>• Total revenue growth trending positively across all clinic locations</p>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
