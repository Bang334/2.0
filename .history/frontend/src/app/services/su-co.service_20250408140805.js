import axios from 'axios';
import authHeader from './auth-header';

const API_URL = '/api/quanly/suco';

class SuCoService {
  getAllSuCo() {
    return axios.get(API_URL, { headers: authHeader() });
  }

  getSuCoByTrangThai(trangThai) {
    return axios.get(`${API_URL}/trangthai/${trangThai}`, { headers: authHeader() });
  }

  updateTrangThaiSuCo(id, trangThai) {
    return axios.put(`${API_URL}/${id}/trangthai?trangThai=${trangThai}`, {}, { headers: authHeader() });
  }

  getThongKeSuCo() {
    return axios.get(`${API_URL}/thongke`, { headers: authHeader() });
  }
}

export default new SuCoService(); 