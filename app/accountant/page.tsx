"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, Download, Calendar } from "lucide-react"

export default function AccountantDashboard() {
  const [userRole, setUserRole] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [viewPeriod, setViewPeriod] = useState("monthly")
  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    const email = localStorage.getItem("userEmail")

    if (!role || role !== "accountant") {
      router.push("/")
      return
    }

    setUserRole(role)
    setUserEmail(email || "")
  }, [router])

  const staffPayroll = [
    {
      id: "E001",
      name: "Dr. Smith",
      role: "Doctor",
      baseSalary: 8000,
      bonus: 1200,
      deductions: 800,
      netSalary: 8400,
    },
    {
      id: "E002",
      name: "Dr. Johnson",
      role: "Doctor",
      baseSalary: 7500,
      bonus: 1000,
      deductions: 750,
      netSalary: 7750,
    },
    {
      id: "E003",
      name: "Sarah Wilson",
      role: "Receptionist",
      baseSalary: 3000,
      bonus: 200,
      deductions: 300,
      netSalary: 2900,
    },
    {
      id: "E004",
      name: "Mike Brown",
      role: "Nurse",
      baseSalary: 4000,
      bonus: 300,
      deductions: 400,
      netSalary: 3900,
    },
    {
      id: "E005",
      name: "Lisa Garcia",
      role: "Technician",
      baseSalary: 3500,
      bonus: 250,
      deductions: 350,
      netSalary: 3400,
    },
  ]

  const totalPayroll = staffPayroll.reduce((sum, staff) => sum + staff.netSalary, 0)

  const handleExportPayroll = () => {
    alert(`Exporting ${viewPeriod} payroll data as CSV/PDF...`)
  }

  if (!userRole) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={userRole} userEmail={userEmail} />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span>Payroll Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">View Period:</span>
                </div>
                <Select value={viewPeriod} onValueChange={setViewPeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleExportPayroll} className="bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                Export Payroll
              </Button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-700">{staffPayroll.length}</div>
                  <div className="text-sm text-blue-600">Total Staff</div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-700">${totalPayroll.toLocaleString()}</div>
                  <div className="text-sm text-green-600">Total Payroll</div>
                </CardContent>
              </Card>

              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-yellow-700">
                    ${staffPayroll.reduce((sum, staff) => sum + staff.bonus, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-yellow-600">Total Bonuses</div>
                </CardContent>
              </Card>

              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-700">
                    ${staffPayroll.reduce((sum, staff) => sum + staff.deductions, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-red-600">Total Deductions</div>
                </CardContent>
              </Card>
            </div>

            {/* Payroll Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Base Salary</TableHead>
                    <TableHead className="text-right">Bonus</TableHead>
                    <TableHead className="text-right">Deductions</TableHead>
                    <TableHead className="text-right">Net Salary</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffPayroll.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium">{staff.id}</TableCell>
                      <TableCell>{staff.name}</TableCell>
                      <TableCell>{staff.role}</TableCell>
                      <TableCell className="text-right">${staff.baseSalary.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-green-600">+${staff.bonus.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-red-600">-${staff.deductions.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium">${staff.netSalary.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <p>
                💡 <strong>Note:</strong> Payroll data is calculated based on {viewPeriod} periods. Export functionality
                generates detailed reports for accounting records.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
