"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"

interface NavbarProps {
  userRole: string
  userEmail: string
}

export function Navbar({ userRole, userEmail }: NavbarProps) {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("userEmail")
    router.push("/")
  }

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      customer: "Customer",
      receptionist: "Receptionist",
      doctor: "Doctor",
      accountant: "Accountant",
      manager: "Manager",
      executive: "Executive",
    }
    return roleNames[role as keyof typeof roleNames] || role
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Clinic Management System</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <User className="h-4 w-4" />
              <span>
                {userEmail} ({getRoleDisplayName(userRole)})
              </span>
            </div>
            <Button onClick={handleLogout} variant="destructive" size="sm" className="flex items-center space-x-1">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
