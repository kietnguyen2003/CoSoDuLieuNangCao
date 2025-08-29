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
import { Search, CreditCard, DollarSign, Receipt, Eye, Plus } from "lucide-react"
import { paymentAPI } from "@/lib/api"

export default function ReceptionistPaymentsPage() {
  const [userRole, setUserRole] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [payments, setPayments] = useState<any[]>([])
  const [filteredPayments, setFilteredPayments] = useState<any[]>([])
  const [summary, setSummary] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDateFrom, setSelectedDateFrom] = useState("")
  const [selectedDateTo, setSelectedDateTo] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5, // Temporarily reduced to test pagination
    total: 0,
    total_pages: 0
  })
  
  // New payment form
  const [showNewPaymentForm, setShowNewPaymentForm] = useState(false)
  const [newPayment, setNewPayment] = useState({
    ma_lich_kham: "",
    tong_tien: "",
    phuong_thuc_thanh_toan: "Tiền mặt"
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
    
    loadPayments()
    loadSummary()
  }, [router])

  const loadPayments = async (page: number = 1) => {
    setIsLoading(true)
    setError("")
    try {
      const filters = {
        page: page,
        limit: pagination.limit,
        ...(selectedDateFrom && { from_date: selectedDateFrom }),
        ...(selectedDateTo && { to_date: selectedDateTo }),
        ...(selectedStatus !== "all" && { status: selectedStatus })
      }
      
      const response = await paymentAPI.getPayments(filters)
      if (response.success && response.data) {
        // Check if response has pagination structure like customers API
        if (response.data) {
          if (Array.isArray(response.data)) {
            setPayments(response.data)
            setFilteredPayments(response.data)
            setPagination(prev => ({ ...prev, page, total: response.data.length }))
          } else if (response.data.payments && response.data.pagination) {
            setPayments(response.data.payments)
            setFilteredPayments(response.data.payments)
            setPagination(response.data.pagination)
          } else {
            setPayments(response.data)
            setFilteredPayments(response.data)
            setPagination(prev => ({ ...prev, page, total: response.data.length }))
          }
        }
      } else {
        setError(response.message || "Failed to load payments")
      }
    } catch (error) {
      console.error("Failed to load payments:", error)
      setError("Failed to load payments")
    } finally {
      setIsLoading(false)
    }
  }

  const loadSummary = async () => {
    try {
      const filters = {
        ...(selectedDateFrom && { from_date: selectedDateFrom }),
        ...(selectedDateTo && { to_date: selectedDateTo })
      }
      
      const response = await paymentAPI.getSummary(filters)
      if (response.success && response.data) {
        setSummary(response.data)
      }
    } catch (error) {
      console.error("Failed to load payment summary:", error)
    }
  }

  useEffect(() => {
    if (!searchTerm) {
      setFilteredPayments(payments)
    } else {
      const filtered = payments.filter(payment => 
        payment.ten_benh_nhan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.ma_thanh_toan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.ma_lich_kham?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredPayments(filtered)
    }
  }, [searchTerm, payments])

  // Reload data when filters change
  useEffect(() => {
    loadPayments(1) // Reset to page 1 when filters change
    loadSummary()
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [selectedDateFrom, selectedDateTo, selectedStatus])

  const handlePageChange = (newPage: number) => {
    loadPayments(newPage)
  }

  const handleCreatePayment = async () => {
    if (!newPayment.ma_lich_kham || !newPayment.tong_tien) {
      setError("Please fill in all required fields")
      return
    }

    setIsLoading(true)
    try {
      const response = await paymentAPI.createPayment({
        ma_lich_kham: newPayment.ma_lich_kham,
        tong_tien: parseFloat(newPayment.tong_tien),
        phuong_thuc_thanh_toan: newPayment.phuong_thuc_thanh_toan
      })

      if (response.success) {
        setMessage("Payment created successfully!")
        setShowNewPaymentForm(false)
        setNewPayment({ ma_lich_kham: "", tong_tien: "", phuong_thuc_thanh_toan: "Tiền mặt" })
        loadPayments(pagination.page) // Keep current page
        loadSummary()
      } else {
        setError(response.message || "Failed to create payment")
      }
    } catch (error) {
      console.error("Create payment error:", error)
      setError("Failed to create payment")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "FAILED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!userRole) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={userRole} userEmail={userEmail} />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Management</h1>
          <p className="text-gray-600">Manage payments, billing, and financial transactions</p>
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(summary.tong_doanh_thu || 0)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-blue-600">{summary.so_giao_dich || 0}</p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cash Payments</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(summary.tien_mat || 0)}
                  </p>
                </div>
                <Receipt className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Card Payments</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(summary.the_ngan_hang || 0)}
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Input
                type="date"
                value={selectedDateFrom}
                onChange={(e) => setSelectedDateFrom(e.target.value)}
                placeholder="From date"
              />
              
              <Input
                type="date"
                value={selectedDateTo}
                onChange={(e) => setSelectedDateTo(e.target.value)}
                placeholder="To date"
              />
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <Button onClick={() => loadPayments(1)} variant="outline" className="flex-1">
                  Refresh
                </Button>
                <Button onClick={() => setShowNewPaymentForm(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New Payment Form */}
        {showNewPaymentForm && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">Create New Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ma_lich_kham">Appointment ID</Label>
                  <Input
                    id="ma_lich_kham"
                    value={newPayment.ma_lich_kham}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, ma_lich_kham: e.target.value }))}
                    placeholder="Enter appointment ID"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tong_tien">Total Amount (VND)</Label>
                  <Input
                    id="tong_tien"
                    type="number"
                    value={newPayment.tong_tien}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, tong_tien: e.target.value }))}
                    placeholder="Enter amount"
                    min="0"
                    step="1000"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phuong_thuc_thanh_toan">Payment Method</Label>
                  <Select
                    value={newPayment.phuong_thuc_thanh_toan}
                    onValueChange={(value) => setNewPayment(prev => ({ ...prev, phuong_thuc_thanh_toan: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tiền mặt">Tiền mặt</SelectItem>
                      <SelectItem value="Thẻ ATM">Thẻ ATM</SelectItem>
                      <SelectItem value="Chuyển khoản">Chuyển khoản</SelectItem>
                      <SelectItem value="Ví điện tử">Ví điện tử</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => setShowNewPaymentForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePayment} disabled={isLoading}>
                  Create Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payments Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <span>Payment Transactions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading payments...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payment ID</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.length > 0 ? (
                        filteredPayments.map((payment) => (
                          <TableRow key={payment.ma_thanh_toan}>
                            <TableCell className="font-medium">{payment.ma_thanh_toan}</TableCell>
                            <TableCell>{payment.ten_benh_nhan}</TableCell>
                            <TableCell>{payment.ten_bac_si}</TableCell>
                            <TableCell className="font-semibold text-green-600">
                              {formatCurrency(payment.tong_tien)}
                            </TableCell>
                            <TableCell>{payment.phuong_thuc_thanh_toan}</TableCell>
                            <TableCell>{formatDate(payment.ngay_thanh_toan)}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(payment.trang_thai)}>
                                {payment.trang_thai}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Receipt className="h-3 w-3 mr-1" />
                                  Invoice
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                            {searchTerm ? "No payments match your search" : "No payments found"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination Controls - Debug */}
                {console.log('Debug pagination:', { 
                  paymentsLength: filteredPayments.length, 
                  totalPages: pagination.total_pages, 
                  pagination: pagination 
                })}
                {filteredPayments.length > 0 && (pagination.total_pages > 1 || filteredPayments.length >= pagination.limit) && (
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
                              key={`payment-page-${page}`}
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
                
                
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}