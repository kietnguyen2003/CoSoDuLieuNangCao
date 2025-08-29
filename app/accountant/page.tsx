"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DollarSign, Download, Calendar, Calculator, Search, Plus, Edit, Trash2, Users, TrendingUp, CreditCard, AlertCircle } from "lucide-react"
import { salaryAPI, paymentAPI } from "@/lib/api"

export default function AccountantDashboard() {
  const [userRole, setUserRole] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [viewPeriod, setViewPeriod] = useState("monthly")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [salaryCalculator, setSalaryCalculator] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    doctorId: "",
    consultationCount: 0,
    consultationRate: 150,
    surgeryCount: 0,
    surgeryRate: 800
  })
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
    
    // Load salary data
    loadSalaryData()
    loadPaymentSummary()
  }, [router])

  const loadSalaryData = async () => {
    try {
      const response = await salaryAPI.getSalaries({
        thang: new Date().getMonth() + 1,
        nam: new Date().getFullYear()
      })
      if (response.success && response.data) {
        const formattedData = response.data.map((salary: any) => ({
          id: salary.ma_user,
          name: salary.ten_nhan_vien,
          role: salary.chuc_vu,
          baseSalary: salary.luong_co_ban,
          bonus: salary.thuong || 0,
          deductions: 0, // This would come from backend
          netSalary: salary.tong_luong,
          lastUpdated: new Date(salary.ngay_tinh_luong).toISOString().split('T')[0],
          status: "Active"
        }))
        setStaffPayroll(formattedData)
      }
    } catch (error) {
      console.error('Failed to load salary data:', error)
    }
  }

  const loadPaymentSummary = async () => {
    try {
      const response = await paymentAPI.getSummary({
        from_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        to_date: new Date().toISOString().split('T')[0]
      })
      if (response.success && response.data) {
        // Update financial summary with real data
        console.log('Payment summary:', response.data)
      }
    } catch (error) {
      console.error('Failed to load payment summary:', error)
    }
  }

  const [staffPayroll, setStaffPayroll] = useState([
    {
      id: "E001",
      name: "Dr. Smith",
      role: "Doctor",
      baseSalary: 8000,
      bonus: 1200,
      deductions: 800,
      netSalary: 8400,
      lastUpdated: "2024-01-15",
      status: "Active"
    },
    {
      id: "E002",
      name: "Dr. Johnson",
      role: "Doctor",
      baseSalary: 7500,
      bonus: 1000,
      deductions: 750,
      netSalary: 7750,
      lastUpdated: "2024-01-15",
      status: "Active"
    },
    {
      id: "E003",
      name: "Sarah Wilson",
      role: "Receptionist",
      baseSalary: 3000,
      bonus: 200,
      deductions: 300,
      netSalary: 2900,
      lastUpdated: "2024-01-15",
      status: "Active"
    },
    {
      id: "E004",
      name: "Mike Brown",
      role: "Nurse",
      baseSalary: 4000,
      bonus: 300,
      deductions: 400,
      netSalary: 3900,
      lastUpdated: "2024-01-15",
      status: "Active"
    },
    {
      id: "E005",
      name: "Lisa Garcia",
      role: "Technician",
      baseSalary: 3500,
      bonus: 250,
      deductions: 350,
      netSalary: 3400,
      lastUpdated: "2024-01-15",
      status: "Active"
    },
  ])

  const totalPayroll = staffPayroll.reduce((sum, staff) => sum + staff.netSalary, 0)
  const totalBonuses = staffPayroll.reduce((sum, staff) => sum + staff.bonus, 0)
  const totalDeductions = staffPayroll.reduce((sum, staff) => sum + staff.deductions, 0)
  const averageSalary = staffPayroll.length > 0 ? Math.round(totalPayroll / staffPayroll.length) : 0

  const filteredPayroll = staffPayroll.filter(staff =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleExportPayroll = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setSuccessMessage(`${viewPeriod.charAt(0).toUpperCase() + viewPeriod.slice(1)} payroll data exported successfully!`)
      setTimeout(() => setSuccessMessage(""), 3000)
    }, 1500)
  }

  const handleEditEmployee = (employee: any) => {
    setSelectedEmployee(employee)
    setIsEditModalOpen(true)
  }

  const handleSaveEmployee = async () => {
    if (selectedEmployee) {
      setIsLoading(true)
      try {
        const response = await salaryAPI.updateSalary(selectedEmployee.id, {
          thuong: selectedEmployee.bonus,
          ghi_chu: `Updated salary on ${new Date().toISOString()}`
        })
        if (response.success) {
          const updatedPayroll = staffPayroll.map(emp =>
            emp.id === selectedEmployee.id ? {
              ...selectedEmployee,
              netSalary: selectedEmployee.baseSalary + selectedEmployee.bonus - selectedEmployee.deductions,
              lastUpdated: new Date().toISOString().split('T')[0]
            } : emp
          )
          setStaffPayroll(updatedPayroll)
          setIsEditModalOpen(false)
          setSuccessMessage("Employee salary updated successfully!")
        } else {
          setErrorMessage(response.message || "Failed to update salary")
        }
      } catch (error) {
        setErrorMessage("Error updating employee salary")
      } finally {
        setIsLoading(false)
      }
      setTimeout(() => setSuccessMessage(""), 3000)
      setTimeout(() => setErrorMessage(""), 3000)
    }
  }

  const calculateDoctorSalary = async () => {
    setIsLoading(true)
    try {
      const response = await salaryAPI.calculateDoctor({
        thang: salaryCalculator.month,
        nam: salaryCalculator.year
      })
      if (response.success && response.data) {
        setSuccessMessage(`Calculated salary for ${response.data.so_bac_si_tinh_luong} doctors in ${salaryCalculator.month}/${salaryCalculator.year}`)
        // Reload salary data to show updated values
        loadSalaryData()
      } else {
        setErrorMessage(response.message || "Failed to calculate doctor salaries")
      }
    } catch (error) {
      setErrorMessage("Error calculating doctor salaries")
    } finally {
      setIsLoading(false)
    }
    setTimeout(() => setSuccessMessage(""), 8000)
    setTimeout(() => setErrorMessage(""), 8000)
  }

  const handleInputChange = (field: string, value: any) => {
    if (selectedEmployee) {
      setSelectedEmployee({ ...selectedEmployee, [field]: value })
    }
  }

  const salaryByRole = staffPayroll.reduce((acc: any, staff) => {
    if (!acc[staff.role]) {
      acc[staff.role] = { count: 0, total: 0, average: 0 }
    }
    acc[staff.role].count += 1
    acc[staff.role].total += staff.netSalary
    acc[staff.role].average = Math.round(acc[staff.role].total / acc[staff.role].count)
    return acc
  }, {})

  if (!userRole) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={userRole} userEmail={userEmail} />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Accountant Dashboard</h1>
          <p className="text-gray-600">Manage payroll, salaries, and financial records</p>
        </div>

        {successMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        {errorMessage && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
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
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button 
                      onClick={handleExportPayroll} 
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={isLoading}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {isLoading ? "Exporting..." : "Export Payroll"}
                    </Button>
                  </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Users className="h-6 w-6 text-blue-600" />
                        <div>
                          <div className="text-2xl font-bold text-blue-700">{staffPayroll.length}</div>
                          <div className="text-sm text-blue-600">Total Staff</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-6 w-6 text-green-600" />
                        <div>
                          <div className="text-2xl font-bold text-green-700">${totalPayroll.toLocaleString()}</div>
                          <div className="text-sm text-green-600">Total Payroll</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-6 w-6 text-yellow-600" />
                        <div>
                          <div className="text-2xl font-bold text-yellow-700">${averageSalary.toLocaleString()}</div>
                          <div className="text-sm text-yellow-600">Average Salary</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-6 w-6 text-purple-600" />
                        <div>
                          <div className="text-2xl font-bold text-purple-700">${totalBonuses.toLocaleString()}</div>
                          <div className="text-sm text-purple-600">Total Bonuses</div>
                        </div>
                      </div>
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
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayroll.map((staff) => (
                        <TableRow key={staff.id}>
                          <TableCell className="font-medium">{staff.id}</TableCell>
                          <TableCell>{staff.name}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              {staff.role}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">${staff.baseSalary.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-green-600">+${staff.bonus.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-red-600">-${staff.deductions.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-medium">${staff.netSalary.toLocaleString()}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              staff.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {staff.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditEmployee(staff)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredPayroll.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No employees found matching your search.
                  </div>
                )}

                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <p>
                    💡 <strong>Note:</strong> Payroll data is calculated based on {viewPeriod} periods. Export functionality
                    generates detailed reports for accounting records.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Doctor Salary Calculator */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  <span>Doctor Salary Calculator</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="month">Month</Label>
                    <Select value={salaryCalculator.month.toString()} onValueChange={(value) => setSalaryCalculator({...salaryCalculator, month: parseInt(value)})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({length: 12}, (_, i) => (
                          <SelectItem key={i+1} value={(i+1).toString()}>
                            {new Date(0, i).toLocaleString('en', {month: 'long'})}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Select value={salaryCalculator.year.toString()} onValueChange={(value) => setSalaryCalculator({...salaryCalculator, year: parseInt(value)})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="consultations">Consultations</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      placeholder="Count"
                      value={salaryCalculator.consultationCount}
                      onChange={(e) => setSalaryCalculator({...salaryCalculator, consultationCount: parseInt(e.target.value) || 0})}
                    />
                    <Input
                      type="number"
                      placeholder="Rate ($)"
                      value={salaryCalculator.consultationRate}
                      onChange={(e) => setSalaryCalculator({...salaryCalculator, consultationRate: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="surgeries">Surgeries</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      placeholder="Count"
                      value={salaryCalculator.surgeryCount}
                      onChange={(e) => setSalaryCalculator({...salaryCalculator, surgeryCount: parseInt(e.target.value) || 0})}
                    />
                    <Input
                      type="number"
                      placeholder="Rate ($)"
                      value={salaryCalculator.surgeryRate}
                      onChange={(e) => setSalaryCalculator({...salaryCalculator, surgeryRate: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <Button onClick={calculateDoctorSalary} className="w-full">
                  Calculate Earnings
                </Button>
              </CardContent>
            </Card>

            {/* Salary Breakdown by Role */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Salary by Role</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(salaryByRole).map(([role, data]: [string, any]) => (
                  <div key={role} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{role}</div>
                      <div className="text-sm text-gray-600">{data.count} employees</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${data.average.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">avg</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Edit Employee Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Employee Salary</DialogTitle>
            </DialogHeader>
            {selectedEmployee && (
              <div className="space-y-4">
                <div>
                  <Label>Employee: {selectedEmployee.name} ({selectedEmployee.id})</Label>
                </div>
                
                <div>
                  <Label htmlFor="baseSalary">Base Salary</Label>
                  <Input
                    type="number"
                    value={selectedEmployee.baseSalary}
                    onChange={(e) => handleInputChange('baseSalary', parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="bonus">Bonus</Label>
                  <Input
                    type="number"
                    value={selectedEmployee.bonus}
                    onChange={(e) => handleInputChange('bonus', parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="deductions">Deductions</Label>
                  <Input
                    type="number"
                    value={selectedEmployee.deductions}
                    onChange={(e) => handleInputChange('deductions', parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-sm text-blue-800">
                    <strong>Net Salary: ${(selectedEmployee.baseSalary + selectedEmployee.bonus - selectedEmployee.deductions).toLocaleString()}</strong>
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <Button onClick={handleSaveEmployee} className="flex-1">
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
