import apiClient from './apiClient'

export default {
  login(credentials) {
    // credentials تحتوي على { phone, password }
    return apiClient.post('/login', credentials)
  },
  sendOtp(payload) {
    // payload تحتوي على { phone, build_mode }
    return apiClient.post('/send-otp', payload)
  },
  register(payload) {
    // payload تحتوي على { full_name, username, phone, password, password_confirmation, code }
    return apiClient.post('/register', payload)
  },
  forgotPassword(payload) {
    // payload تحتوي على { phone }
    return apiClient.post('/forgot-password', payload)
  },
  resetPassword(payload) {
    // payload تحتوي على { phone, code, password, password_confirmation }
    return apiClient.post('/reset-password', payload)
  },
  logout() {
    return apiClient.post('/logout')
  },
  getUser() {
    return apiClient.get('/user')
  },
}
