"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, FlaskConical, Calendar, Download, Eye, FileText } from "lucide-react"
import { labTestAPI, type LabTest } from "@/lib/api"

export default function CustomerLabResultsPage() {
  const [userRole, setUserRole] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [labTests, setLabTests] = useState<LabTest[]>([])
  const [filteredTests, setFilteredTests] = useState<LabTest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null)
  const [error, setError] = useState("")
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
    
    loadLabTests()
  }, [router])

  const loadLabTests = async () => {
    setIsLoading(true)
    setError("")
    try {
      const response = await labTestAPI.getLabTests()
      if (response.success && response.data) {
        setLabTests(response.data)
        setFilteredTests(response.data)
      } else {
        setError(response.message || "Failed to load lab test results")
      }
    } catch (error) {
      console.error("Failed to load lab tests:", error)
      setError("Failed to load lab test results")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!searchTerm) {
      setFilteredTests(labTests)
    } else {
      const filtered = labTests.filter(test => 
        test.loai_xet_nghiem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.ma_xet_nghiem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (test.ket_qua && test.ket_qua.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredTests(filtered)
    }
  }, [searchTerm, labTests])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleViewDetails = async (testId: string) => {
    try {
      const response = await labTestAPI.getLabTest(testId)
      if (response.success && response.data) {
        setSelectedTest(response.data)
      }
    } catch (error) {
      console.error("Failed to load test details:", error)
    }
  }

  const handleDownloadPDF = (test: LabTest) => {
    // This would typically generate and download a PDF
    // For now, we'll just show an alert
    alert(`PDF download for test ${test.ma_xet_nghiem} would be implemented here`)
  }

  if (!userRole) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={userRole} userEmail={userEmail} />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lab Test Results</h1>
          <p className="text-gray-600">View your laboratory test results and medical reports</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search and Filter */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by test type, ID, or results..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={loadLabTests} variant="outline">
                Refresh Results
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6">
          {/* Lab Tests List */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FlaskConical className="h-5 w-5 text-purple-600" />
                <span>Your Lab Test Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading lab results...</p>
                </div>
              ) : filteredTests.length > 0 ? (
                <div className="space-y-4">
                  {filteredTests.map((test) => (
                    <Card key={test.ma_xet_nghiem} className="border-l-4 border-l-purple-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{test.loai_xet_nghiem}</h3>
                            <p className="text-sm text-gray-600">Test ID: {test.ma_xet_nghiem}</p>
                            <p className="text-sm text-gray-600">Doctor: {test.ten_bac_si || "Unknown"}</p>
                          </div>
                          <Badge className={getStatusColor(test.status)}>
                            {test.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              Test Date: {formatDate(test.ngay_xet_nghiem)}
                            </span>
                          </div>
                        </div>

                        {test.ket_qua && (
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 mb-2">Results:</h4>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{test.ket_qua}</p>
                            </div>
                          </div>
                        )}

                        {test.ghi_chu && (
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 mb-2">Notes:</h4>
                            <p className="text-sm text-gray-600">{test.ghi_chu}</p>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(test.ma_xet_nghiem)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadPDF(test)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download PDF
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FlaskConical className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Lab Results Found</h3>
                  <p className="text-gray-600">
                    {searchTerm 
                      ? "No results match your search criteria" 
                      : "You don't have any lab test results yet"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Selected Test Details Modal */}
        {selectedTest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <span>Test Details - {selectedTest.loai_xet_nghiem}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTest(null)}
                  >
                    Close
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="font-medium text-gray-900">Test ID:</label>
                    <p className="text-gray-600">{selectedTest.ma_xet_nghiem}</p>
                  </div>
                  
                  <div>
                    <label className="font-medium text-gray-900">Test Type:</label>
                    <p className="text-gray-600">{selectedTest.loai_xet_nghiem}</p>
                  </div>
                  
                  <div>
                    <label className="font-medium text-gray-900">Test Date:</label>
                    <p className="text-gray-600">{formatDate(selectedTest.ngay_xet_nghiem)}</p>
                  </div>
                  
                  <div>
                    <label className="font-medium text-gray-900">Doctor:</label>
                    <p className="text-gray-600">{selectedTest.ten_bac_si || "Unknown"}</p>
                  </div>
                  
                  <div>
                    <label className="font-medium text-gray-900">Status:</label>
                    <Badge className={`ml-2 ${getStatusColor(selectedTest.status)}`}>
                      {selectedTest.status}
                    </Badge>
                  </div>

                  {selectedTest.ket_qua && (
                    <div>
                      <label className="font-medium text-gray-900">Detailed Results:</label>
                      <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedTest.ket_qua}</p>
                      </div>
                    </div>
                  )}

                  {selectedTest.ghi_chu && (
                    <div>
                      <label className="font-medium text-gray-900">Doctor's Notes:</label>
                      <p className="text-gray-600 mt-1">{selectedTest.ghi_chu}</p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => handleDownloadPDF(selectedTest)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="mt-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-2">
                <div className="text-blue-600 mt-0.5">🔒</div>
                <div>
                  <p className="text-sm text-blue-800 font-medium mb-1">Medical Privacy Notice</p>
                  <p className="text-xs text-blue-700">
                    Your lab test results are confidential medical information protected under HIPAA. 
                    Only you and your healthcare providers have access to this information.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}