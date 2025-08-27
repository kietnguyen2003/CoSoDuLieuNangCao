const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

// Types
export interface User {
  ma_user: string
  ho_ten: string
  so_dien_thoai?: string
  email?: string
  ten_dang_nhap: string
  trang_thai: string
  ngay_tao: string
  role: string
}

export interface Customer extends User {
  ngay_sinh?: string
  gioi_tinh?: string
  dia_chi?: string
  ngay_dang_ky: string
  ma_bao_hiem?: string
}

export interface Appointment {
  ma_lich_kham: string
  ma_customer: string
  ma_bac_si: string
  ma_phong_kham: string
  ngay_gio_kham: string
  trang_thai: string
  ghi_chu?: string
  ngay_dat: string
  ten_khach_hang?: string
  ten_bac_si?: string
  ten_phong_kham?: string
}

export interface MedicalRecord {
  ma_ho_so: string
  ma_customer: string
  ma_bac_si: string
  ma_phong_kham: string
  ngay_kham: string
  trieu_chung?: string
  chan_doan?: string
  huong_dan_dieu_tri?: string
  ma_icd10?: string
  ngay_tai_kham?: string
  ten_khach_hang?: string
}

export interface Prescription {
  ma_don_thuoc: string
  ma_ho_so: string
  ngay_ke_don: string
  ghi_chu?: string
  medications: PrescriptionMedication[]
  ten_khach_hang?: string
  ten_bac_si?: string
}

export interface PrescriptionMedication {
  ma_thuoc: string
  ten_thuoc: string
  so_luong: number
  cach_dung: string
  ghi_chu?: string
}

export interface LabTest {
  ma_xet_nghiem: string
  ma_ho_so: string
  loai_xet_nghiem: string
  ngay_xet_nghiem: string
  ket_qua?: string
  ghi_chu?: string
  status: string
  ten_khach_hang?: string
  ten_bac_si?: string
}

export interface APIResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken')
  }
  return null
}

// Helper function to make authenticated requests
const makeRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> => {
  const token = getAuthToken()
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    const data = await response.json()
    
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'An error occurred',
        error: data.error || `HTTP ${response.status}`,
      }
    }
    
    return data
  } catch (error) {
    return {
      success: false,
      message: 'Network error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Auth API
export const authAPI = {
  login: async (credentials: { ten_dang_nhap: string; mat_khau: string }) => {
    return makeRequest<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  },

  register: async (userData: {
    ho_ten: string
    ten_dang_nhap: string
    mat_khau: string
    email?: string
    so_dien_thoai?: string
  }) => {
    return makeRequest<{ user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },

  forgotPassword: async (email: string) => {
    return makeRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  resetPassword: async (data: {
    email: string
    reset_code: string
    new_password: string
  }) => {
    return makeRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}

// User API
export const userAPI = {
  getProfile: async () => {
    return makeRequest<User>('/users/profile')
  },

  updateProfile: async (profileData: Partial<Customer>) => {
    return makeRequest<Customer>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  },

  changePassword: async (passwordData: {
    current_password: string
    new_password: string
  }) => {
    return makeRequest('/users/password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    })
  },
}

// Appointment API
export const appointmentAPI = {
  getAppointments: async (filters?: { status?: string }) => {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    
    const endpoint = '/appointments' + (params.toString() ? `?${params.toString()}` : '')
    return makeRequest<Appointment[]>(endpoint)
  },

  getAppointment: async (id: string) => {
    return makeRequest<Appointment>(`/appointments/${id}`)
  },

  createAppointment: async (appointmentData: {
    ma_bac_si: string
    ma_phong_kham: string
    ngay_gio_kham: string
    ghi_chu?: string
  }) => {
    return makeRequest<{ appointment_id: string }>('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    })
  },

  updateAppointment: async (id: string, updateData: Partial<Appointment>) => {
    return makeRequest(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    })
  },

  cancelAppointment: async (id: string) => {
    return makeRequest(`/appointments/${id}`, {
      method: 'DELETE',
    })
  },
}

// Medical Record API
export const medicalRecordAPI = {
  getMedicalRecords: async (filters?: { ma_customer?: string }) => {
    const params = new URLSearchParams()
    if (filters?.ma_customer) params.append('ma_customer', filters.ma_customer)
    
    const endpoint = '/medical-records' + (params.toString() ? `?${params.toString()}` : '')
    return makeRequest<MedicalRecord[]>(endpoint)
  },

  getMedicalRecord: async (id: string) => {
    return makeRequest<MedicalRecord>(`/medical-records/${id}`)
  },

  createMedicalRecord: async (recordData: Omit<MedicalRecord, 'ma_ho_so'>) => {
    return makeRequest<{ ma_ho_so: string }>('/medical-records', {
      method: 'POST',
      body: JSON.stringify(recordData),
    })
  },

  updateMedicalRecord: async (id: string, updateData: Partial<MedicalRecord>) => {
    return makeRequest(`/medical-records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    })
  },
}

// Prescription API (for doctors)
export const prescriptionAPI = {
  getPrescriptions: async (filters?: { ma_ho_so?: string; status?: string }) => {
    const params = new URLSearchParams()
    if (filters?.ma_ho_so) params.append('ma_ho_so', filters.ma_ho_so)
    if (filters?.status) params.append('status', filters.status)
    
    const endpoint = '/prescriptions' + (params.toString() ? `?${params.toString()}` : '')
    return makeRequest<Prescription[]>(endpoint)
  },

  getPrescription: async (id: string) => {
    return makeRequest<Prescription>(`/prescriptions/${id}`)
  },

  createPrescription: async (prescriptionData: {
    ma_ho_so: string
    medications: PrescriptionMedication[]
    ghi_chu?: string
  }) => {
    return makeRequest<{ ma_don_thuoc: string }>('/prescriptions', {
      method: 'POST',
      body: JSON.stringify(prescriptionData),
    })
  },

  updatePrescription: async (id: string, prescriptionData: {
    ma_ho_so: string
    medications: PrescriptionMedication[]
    ghi_chu?: string
  }) => {
    return makeRequest(`/prescriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(prescriptionData),
    })
  },

  getMedications: async (query?: string) => {
    const params = new URLSearchParams()
    if (query) params.append('q', query)
    
    const endpoint = '/medications' + (params.toString() ? `?${params.toString()}` : '')
    return makeRequest<any[]>(endpoint)
  },
}

// Lab Test API
export const labTestAPI = {
  getLabTests: async (filters?: { ma_ho_so?: string; status?: string }) => {
    const params = new URLSearchParams()
    if (filters?.ma_ho_so) params.append('ma_ho_so', filters.ma_ho_so)
    if (filters?.status) params.append('status', filters.status)
    
    const endpoint = '/lab-tests' + (params.toString() ? `?${params.toString()}` : '')
    return makeRequest<LabTest[]>(endpoint)
  },

  getLabTest: async (id: string) => {
    return makeRequest<LabTest>(`/lab-tests/${id}`)
  },

  createLabOrder: async (labTestData: {
    ma_ho_so: string
    loai_xet_nghiem: string
    ghi_chu?: string
    ngay_xet_nghiem?: string
  }) => {
    return makeRequest<{ ma_xet_nghiem: string }>('/lab-tests', {
      method: 'POST',
      body: JSON.stringify(labTestData),
    })
  },

  updateLabTest: async (id: string, updateData: {
    ket_qua?: string
    ghi_chu?: string
    loai_xet_nghiem?: string
    ngay_xet_nghiem?: string
  }) => {
    return makeRequest(`/lab-tests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    })
  },

  deleteLabTest: async (id: string) => {
    return makeRequest(`/lab-tests/${id}`, {
      method: 'DELETE',
    })
  },

  getLabTestTypes: async () => {
    return makeRequest<string[]>('/lab-test-types')
  },
}

// Clinic API
export const clinicAPI = {
  getClinics: async () => {
    return makeRequest<any[]>('/clinics')
  },

  getClinic: async (id: string) => {
    return makeRequest<any>(`/clinics/${id}`)
  },

  getDoctors: async (clinicId: string, specialty?: string) => {
    const params = new URLSearchParams()
    if (specialty) params.append('chuyen_khoa', specialty)
    
    const endpoint = `/clinics/${clinicId}/doctors` + (params.toString() ? `?${params.toString()}` : '')
    return makeRequest<{
      all_doctors: any[]
      previously_visited: any[]
      other_doctors: any[]
    }>(endpoint)
  },

  getSpecialties: async () => {
    return makeRequest<string[]>('/clinics/specialties')
  },

  getSchedules: async (clinicId: string, doctorId: string, date: string) => {
    const params = new URLSearchParams()
    params.append('doctor_id', doctorId)
    params.append('date', date)
    
    const endpoint = `/clinics/${clinicId}/schedules?${params.toString()}`
    return makeRequest<{
      work_schedule: { start_time: string; end_time: string }
      available_slots: string[]
      booked_times: string[]
    }>(endpoint)
  },
}

// Schedule API
export const scheduleAPI = {
  getSchedules: async (filters?: {
    doctor_id?: string
    clinic_id?: string
    date_from?: string
    date_to?: string
  }) => {
    const params = new URLSearchParams()
    if (filters?.doctor_id) params.append('doctor_id', filters.doctor_id)
    if (filters?.clinic_id) params.append('clinic_id', filters.clinic_id)
    if (filters?.date_from) params.append('date_from', filters.date_from)
    if (filters?.date_to) params.append('date_to', filters.date_to)
    
    const endpoint = '/schedules' + (params.toString() ? `?${params.toString()}` : '')
    return makeRequest<any[]>(endpoint)
  },

  getSchedule: async (id: string) => {
    return makeRequest<any>(`/schedules/${id}`)
  },

  createSchedule: async (scheduleData: {
    ma_bac_si: string
    ma_phong_kham: string
    ngay_lam_viec: string
    gio_bat_dau: string
    gio_ket_thuc: string
    status?: string
  }) => {
    return makeRequest<{ ma_lich_lam_viec: string }>('/schedules', {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    })
  },

  updateSchedule: async (id: string, updateData: any) => {
    return makeRequest(`/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    })
  },

  deleteSchedule: async (id: string) => {
    return makeRequest(`/schedules/${id}`, {
      method: 'DELETE',
    })
  },
}

// Customer API (for receptionist)
export const customerAPI = {
  getCustomers: async (search?: string) => {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    
    const endpoint = '/customers' + (params.toString() ? `?${params.toString()}` : '')
    return makeRequest<any[]>(endpoint)
  },

  getCustomer: async (id: string) => {
    return makeRequest<any>(`/customers/${id}`)
  },

  createCustomer: async (customerData: {
    ho_ten: string
    ten_dang_nhap: string
    mat_khau: string
    so_dien_thoai?: string
    email?: string
    ngay_sinh?: string
    gioi_tinh?: string
    dia_chi?: string
    ma_bao_hiem?: string
  }) => {
    return makeRequest<{ user_id: string }>('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    })
  },
}

// Export default API object
export default {
  auth: authAPI,
  user: userAPI,
  appointment: appointmentAPI,
  medicalRecord: medicalRecordAPI,
  prescription: prescriptionAPI,
  labTest: labTestAPI,
  clinic: clinicAPI,
  schedule: scheduleAPI,
  customer: customerAPI,
}