import React, { useState, useEffect } from "react";
import { Row, Col, Card, Form, Button, Table, Badge, Modal, Nav, Tab, Alert } from "react-bootstrap";
import { format } from 'date-fns';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import UserService from "../services/user.service";
import axios from "axios";
import authHeader from "../services/auth-header";
import { API_URL } from "../services/api";

const MuonPhongManager = ({ 
  yeuCauMuonPhong, 
  lichSuMuonPhong,
  danhSachPhong, 
  onError, 
  onSuccess, 
  onRefresh,
  isGiangVien = false
}) => {
  // Khởi tạo giá trị mặc định cho thời gian mượn là thời gian hiện tại
  const getDefaultBookingTime = () => {
    const currentDate = new Date();
    
    // Làm tròn đến 5 phút gần nhất
    const roundedMinutes = Math.ceil(currentDate.getMinutes() / 5) * 5;
    currentDate.setMinutes(roundedMinutes);
    currentDate.setSeconds(0);
    currentDate.setMilliseconds(0);
    
    // Nếu thời gian hiện tại sau 22h hoặc trước 7h, đặt mặc định là 7h sáng ngày tiếp theo
    if (currentDate.getHours() < 7) {
      currentDate.setHours(7);
      currentDate.setMinutes(0);
    } else if (currentDate.getHours() >= 22) {
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(7);
      currentDate.setMinutes(0);
    } else if (roundedMinutes === 60) {
      // Nếu làm tròn lên thành 60 phút, điều chỉnh giờ và phút cho đúng
      currentDate.setHours(currentDate.getHours() + 1);
      currentDate.setMinutes(0);
    }
    
    return currentDate;
  };

  // Tính thời gian trả mặc định (2 giờ sau thời gian mượn)
  const getDefaultReturnTime = (bookingTime) => {
    if (!bookingTime) return null;
    
    const returnTime = new Date(bookingTime);
    returnTime.setHours(returnTime.getHours() + 2);
    
    // Kiểm tra nếu thời gian trả vượt quá 22h, giới hạn lại thành 22h
    if (returnTime.getHours() >= 22) {
      returnTime.setHours(22);
      returnTime.setMinutes(0);
    }
    
    return returnTime;
  };

  // Tính ngày tối đa có thể đặt (7 ngày từ hiện tại)
  const getMaxBookingDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    return maxDate;
  };

  // Danh sách các loại phòng
  const loaiPhongOptions = ["Phòng học", "Phòng thực hành"];

  // Form states
  const [muonPhongForm, setMuonPhongForm] = useState({ 
    maPhong: "", 
    thoiGianMuon: getDefaultBookingTime(),
    thoiGianTra: getDefaultReturnTime(getDefaultBookingTime()),
    mucDich: "",
    soChoDat: "",
    thietBiYeuCau: [] // Add field for required equipment
  });
  const [phanHoiForm, setPhanHoiForm] = useState({ maYeuCau: "", danhGia: 5, nhanXet: "" });
  
  // Modal states
  const [showPhanHoiModal, setShowPhanHoiModal] = useState(false);
  const [showSuCoModal, setShowSuCoModal] = useState(false);
  const [showChiTietModal, setShowChiTietModal] = useState(false);
  const [showXacNhanTraModal, setShowXacNhanTraModal] = useState(false);
  const [showXacNhanHuyModal, setShowXacNhanHuyModal] = useState(false);
  const [suCoForm, setSuCoForm] = useState({ maYeuCau: "", maLichSu: null, moTa: "" });
  const [selectedYeuCau, setSelectedYeuCau] = useState(null);
  const [loading, setLoading] = useState(false);
  const [daDanhGiaList, setDaDanhGiaList] = useState({});
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState("register");
  const [daBaoCaoList, setDaBaoCaoList] = useState({});
  const [showMuonPhongNangCaoModal, setShowMuonPhongNangCaoModal] = useState(false);
  const [muonPhongNangCaoForm, setMuonPhongNangCaoForm] = useState({
    soChoDat: "",
    loaiPhong: "",
    thoiGianMuon: getDefaultBookingTime(),
    thoiGianTra: getDefaultReturnTime(getDefaultBookingTime()),
    maPhong: "",
    mucDich: "",
    thietBiYeuCau: [] // Add field for required equipment
  });
  const [loadingNangCao, setLoadingNangCao] = useState(false);
  const [phongTrongList, setPhongTrongList] = useState([]);
  const [goiYPhongGanNhat, setGoiYPhongGanNhat] = useState([]);
  const [loadingTimPhong, setLoadingTimPhong] = useState(false);
  
  // State for equipment options
  const [thietBiOptions, setThietBiOptions] = useState([]);
  const [loadingThietBi, setLoadingThietBi] = useState(false);
  
  // Time intervals and filters
  const timeIntervals = 15;

  // Fetch equipment data when component loads
  useEffect(() => {
    fetchThietBiData();
  }, []);

  // Fetch feedback status and incident report status when component loads or when lichSuMuon changes
  useEffect(() => {
    fetchDanhGiaStatus();
    fetchBaoCaoStatus();
  }, [yeuCauMuonPhong, lichSuMuonPhong]);

  // Fetch equipment data from the backend
  const fetchThietBiData = async () => {
    try {
      setLoadingThietBi(true);
      const response = await UserService.getAllThietBi();
      const thietBiData = response.data.map(item => ({
        value: item.maThietBi.toString(),
        label: item.tenThietBi
      }));
      setThietBiOptions(thietBiData);
      setLoadingThietBi(false);
    } catch (error) {
      console.error("Error fetching equipment data:", error);
      setLoadingThietBi(false);
      if (onError) onError("Không thể tải dữ liệu thiết bị. Vui lòng thử lại sau.");
    }
  };

  // Fetch status of feedback for all requests
  const fetchDanhGiaStatus = async () => {
    try {
      // Get all request IDs that might need feedback (from both sources)
      const yeucauIDs = yeuCauMuonPhong
        .filter(yc => yc.trangThai === 'DADUYET' && yc.thoiGianTra)
        .map(yc => yc.maYeuCau);
      
      // Make sure lichSuMuonPhong is defined before using it
      const lichsuIDs = lichSuMuonPhong && lichSuMuonPhong.length > 0 ? 
        lichSuMuonPhong.map(ls => ls.maYeuCau) : [];
      
      // Combine both arrays and remove duplicates
      const allRequestIDs = [...new Set([...yeucauIDs, ...lichsuIDs])];
      
      if (allRequestIDs.length === 0) return;
      
      // Use the UserService to check which requests have been evaluated
      let response;
      if (isGiangVien) {
        response = await UserService.kiemTraDanhGiaGV(allRequestIDs);
      } else {
        response = await UserService.kiemTraDanhGia(allRequestIDs);
      }
      
      setDaDanhGiaList(response.data || {});
      
      console.log("Feedback status loaded:", response.data);
    } catch (error) {
      console.error("Error fetching feedback status:", error);
      // Don't show error notification to user for this background check
    }
  };

  // Fetch incident report status for all requests
  const fetchBaoCaoStatus = async () => {
    try {
      // Get all request IDs
      const yeucauIDs = yeuCauMuonPhong
        .map(yc => yc.maYeuCau);
      
      // Make sure lichSuMuonPhong is defined before using it
      const lichsuIDs = lichSuMuonPhong && lichSuMuonPhong.length > 0 ? 
        lichSuMuonPhong.map(ls => ls.maYeuCau) : [];
      
      // Combine both arrays and remove duplicates
      const allRequestIDs = [...new Set([...yeucauIDs, ...lichsuIDs])];
      
      if (allRequestIDs.length === 0) return;
      
      // Check each request ID
      const newDaBaoCaoList = {};
      
      for (const maYeuCau of allRequestIDs) {
        try {
          const response = await UserService.kiemTraDaBaoSuCo(maYeuCau);
          newDaBaoCaoList[maYeuCau] = response.data.daBaoCao;
        } catch (error) {
          console.error(`Error checking incident report status for request ${maYeuCau}:`, error);
        }
      }
      
      setDaBaoCaoList(newDaBaoCaoList);
      console.log("Incident report status loaded:", newDaBaoCaoList);
    } catch (error) {
      console.error("Error fetching incident report status:", error);
      // Don't show error notification to user for this background check
    }
  };

  // Check if a request has been evaluated
  const isDaDanhGia = (maYeuCau) => {
    return daDanhGiaList[maYeuCau] === true;
  };

  // Check if a request has an incident report
  const isDaBaoCao = (maYeuCau) => {
    return daBaoCaoList[maYeuCau] === true;
  };

  // Utility functions
  const formatDate = (dateString) => dateString ? format(new Date(dateString), 'dd/MM/yyyy HH:mm') : '';
  
  // Thêm hàm để hiển thị khoảng thời gian trước yêu cầu
  const tinhThoiGianTruoc = (thoiGianYeuCau) => {
    if (!thoiGianYeuCau) return "-";
    
    const now = new Date();
    const thoiGianMuon = new Date(thoiGianYeuCau);
    
    // Nếu thời gian mượn đã qua, hiển thị dấu gạch
    if (thoiGianMuon <= now) return "-";
    
    // Tính khoảng thời gian còn lại tính bằng phút
    const diffMs = thoiGianMuon - now;
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (isNaN(diffMinutes) || diffMinutes < 0) return "-";
    return `${diffMinutes} phút`;
  };

  // Form handler
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMuonPhongForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handlePhanHoiFormChange = (e) => {
    const { name, value } = e.target;
    setPhanHoiForm(prev => ({ ...prev, [name]: value }));
  };

  // Form validation
  const validateBookingTime = () => {
    const now = new Date();
    
    if (!muonPhongForm.thoiGianMuon || !muonPhongForm.thoiGianTra) {
      if (onError) onError("Vui lòng chọn thời gian mượn và trả");
      return false;
    }

    if (muonPhongForm.thoiGianMuon < now) {
      if (onError) onError("Thời gian mượn phải là thời gian trong tương lai");
      return false;
    }

    if (muonPhongForm.thoiGianTra <= muonPhongForm.thoiGianMuon) {
      if (onError) onError("Thời gian trả phải sau thời gian mượn");
      return false;
    }

    // Check if booking and return are on the same day
    if (muonPhongForm.thoiGianMuon.toDateString() !== muonPhongForm.thoiGianTra.toDateString()) {
      if (onError) onError("Thời gian mượn và trả phải trong cùng một ngày");
      return false;
    }

    return true;
  };

  // Filter available times (7:00 AM to 10:00 PM)
  const filterTime = (date) => {
    const hours = date.getHours();
    return hours >= 7 && hours < 22;
  };

  // Filter return times (must be after booking time)
  const filterReturnTime = (date) => {
    if (!muonPhongForm.thoiGianMuon) return false;
    
    const hours = date.getHours();
    if (hours < 7 || hours >= 22) return false;

    const bookingDate = new Date(muonPhongForm.thoiGianMuon);
    return date > bookingDate && date.toDateString() === bookingDate.toDateString();
  };

  // Filter return times for advanced booking form
  const filterReturnTimeNangCao = (date) => {
    if (!muonPhongNangCaoForm.thoiGianMuon) return false;
    
    const hours = date.getHours();
    if (hours < 7 || hours >= 22) return false;

    const bookingDate = new Date(muonPhongNangCaoForm.thoiGianMuon);
    return date > bookingDate && date.toDateString() === bookingDate.toDateString();
  };

  // Handle booking time change
  const handleBookingTimeChange = (date) => {
    setMuonPhongForm(prev => ({ 
      ...prev, 
      thoiGianMuon: date,
      // Tự động cập nhật thời gian trả là 2 giờ sau thời gian mượn
      thoiGianTra: getDefaultReturnTime(date)
    }));
  };

  const getFilteredRooms = () => {
    if (!muonPhongForm.soChoDat || isNaN(parseInt(muonPhongForm.soChoDat)) || parseInt(muonPhongForm.soChoDat) <= 0) {
      return [];
    }
    
    const soChoDat = parseInt(muonPhongForm.soChoDat, 10);
    
    // First filter by capacity
    let filteredRooms = danhSachPhong.filter(phong => phong.sucChua >= soChoDat);
    
    // Then filter by required equipment if any is selected
    if (muonPhongForm.thietBiYeuCau && muonPhongForm.thietBiYeuCau.length > 0) {
      filteredRooms = filteredRooms.filter(phong => {
        // Check if the room has the thietBis attribute
        if (!phong.thietBis) return false;
        
        // Check if all required equipment is available in the room
        return muonPhongForm.thietBiYeuCau.every(reqEquipId => 
          phong.thietBis.some(phongThietBi => 
            phongThietBi.thietBi.maThietBi.toString() === reqEquipId
          )
        );
      });
    }
    
    return filteredRooms;
  };

  const handleMuonPhongSubmit = async (e) => {
    e.preventDefault();
    if (!validateBookingTime()) {
      return;
    }

    try {
      setLoading(true);
      const formData = {
        ...muonPhongForm,
        thoiGianMuon: muonPhongForm.thoiGianMuon.toISOString(),
        thoiGianTra: muonPhongForm.thoiGianTra.toISOString(),
        thietBiYeuCau: muonPhongForm.thietBiYeuCau.length > 0 ? muonPhongForm.thietBiYeuCau : undefined
      };

      let response;
      if (isGiangVien) {
        response = await UserService.yeuCauMuonPhongGV(formData);
      } else {
        response = await UserService.yeuCauMuonPhong(formData);
      }
      
      if (onSuccess) onSuccess(response.data.message || "Đã gửi yêu cầu mượn phòng thành công!");
      
      // Reset form
      setMuonPhongForm({ 
        maPhong: "", 
        thoiGianMuon: getDefaultBookingTime(), 
        thoiGianTra: getDefaultReturnTime(getDefaultBookingTime()), 
        mucDich: "", 
        soChoDat: "",
        thietBiYeuCau: []
      });
      
      // Chuyển tab và làm mới dữ liệu
      setActiveTab("requests");
      
      // Gọi hàm refresh để cập nhật dữ liệu
      if (onRefresh) {
        // Đợi một chút để đảm bảo mọi hoạt động đã hoàn tất
        setTimeout(() => {
          onRefresh();
        }, 300);
      }
      
      setLoading(false);
    } catch (error) {
      if (onError) onError(error.response?.data?.message || error.message);
      setLoading(false);
    }
  };

  const handleTraPhong = async (maYeuCau) => {
    try {
      setLoading(true);
      let response;
      if (isGiangVien) {
        response = await UserService.traPhongHocGV(maYeuCau);
      } else {
        response = await UserService.traPhongHoc(maYeuCau);
      }
      
      if (onSuccess) onSuccess(response.data.message || "Đã trả phòng thành công!");
      if (onRefresh) onRefresh();
      setLoading(false);
    } catch (error) {
      if (onError) onError(error.response?.data?.message || error.message);
      setLoading(false);
    }
  };

  const fetchExistingFeedback = async (maYeuCau) => {
    try {
      let response;
      if (isGiangVien) {
        response = await UserService.getPhanHoiGV(parseInt(maYeuCau));
      } else {
        response = await UserService.getPhanHoi(parseInt(maYeuCau));
      }
      
      setExistingFeedback(response.data);
      setPhanHoiForm({ 
        maYeuCau: response.data.maYeuCau,
        maLichSu: response.data.maLichSu, 
        danhGia: response.data.danhGia, 
        nhanXet: response.data.nhanXet || "",
        idPhanHoi: response.data.id || response.data.idPhanHoi
      });
      setIsEditingFeedback(true);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      handleError("Không thể tải đánh giá đã có. Vui lòng thử lại sau.");
      setIsEditingFeedback(false);
    }
  };

  const openPhanHoiModal = async (yeuCau) => {
    const formattedYeuCau = activeTab === "history" ? {
      maYeuCau: yeuCau.maYeuCau,
      maLichSu: yeuCau.maLichSu,
      phong: { maPhong: yeuCau.maPhong }
    } : yeuCau;
    
    setSelectedYeuCau(formattedYeuCau);
    
    if (isDaDanhGia(yeuCau.maYeuCau)) {
      await fetchExistingFeedback(yeuCau.maYeuCau);
    } else {
      setPhanHoiForm({ 
        maYeuCau: yeuCau.maYeuCau, 
        maLichSu: yeuCau.maLichSu,
        danhGia: 5, 
        nhanXet: ""
      });
      setIsEditingFeedback(false);
    }
    
    setShowPhanHoiModal(true);
  };

  const handlePhanHoiSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      let response;
      
      if (isGiangVien) {
        response = await UserService.handlePhanHoiSubmitGV(phanHoiForm, isEditingFeedback);
      } else {
        response = await UserService.handlePhanHoiSubmit(phanHoiForm, isEditingFeedback);
      }
      
      if (onSuccess) {
        if (isEditingFeedback) {
          onSuccess(response.data.message || "Đã cập nhật đánh giá thành công!");
          if (response.data.phanHoi) {
            setExistingFeedback(response.data.phanHoi);
          }
        } else {
          onSuccess(response.data.message || "Đã gửi đánh giá thành công!");
        }
      }
      
      setDaDanhGiaList(prev => ({ ...prev, [phanHoiForm.maYeuCau]: true }));
      setShowPhanHoiModal(false);
      fetchDanhGiaStatus();
      
      if (onRefresh) onRefresh();
      setLoading(false);
    } catch (error) {
      if (onError) onError(error.response?.data?.message || error.message);
      setLoading(false);
    }
  };

  const handleError = (message) => {
    if (onError) onError(message);
  };

  const handleBaoSuCo = async (yeuCau) => {
    const formattedYeuCau = typeof yeuCau === 'object' ? yeuCau : { maYeuCau: yeuCau };
    setSelectedYeuCau(formattedYeuCau);
    setSuCoForm({
      maYeuCau: formattedYeuCau.maYeuCau,
      moTa: ""
    });
    setShowSuCoModal(true);
  };

  const handleSuCoFormChange = (e) => {
    const { name, value } = e.target;
    setSuCoForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSuCoSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      let response;
      if (isGiangVien) {
        response = await UserService.baoSuCoGV(suCoForm);
      } else {
        response = await UserService.baoSuCo(suCoForm);
      }
      
      if (onSuccess) onSuccess(response.data.message || "Đã gửi báo cáo sự cố thành công!");
      
      setDaBaoCaoList(prev => ({
        ...prev,
        [suCoForm.maYeuCau]: true
      }));
      
      setShowSuCoModal(false);
      setLoading(false);
    } catch (error) {
      if (onError) onError(error.response?.data?.message || error.message);
      setLoading(false);
    }
  };

  const handleXemChiTiet = async (yeuCau) => {
    try {
      let response;
      
      if (isGiangVien) {
        response = await UserService.getChiTietYeuCauGV(yeuCau.maYeuCau);
      } else {
        response = await UserService.getChiTietYeuCau(yeuCau.maYeuCau);
      }
      
      setSelectedYeuCau(response.data);
      setShowChiTietModal(true);
    } catch (error) {
      if (onError) onError(error.response?.data?.message || error.message);
    }
  };

  const handleXacNhanTraPhong = (yeuCau) => {
    setSelectedYeuCau(yeuCau);
    setShowXacNhanTraModal(true);
  };

  const confirmTraPhong = () => {
    handleTraPhong(selectedYeuCau.maYeuCau);
    setShowXacNhanTraModal(false);
  };

  const handleHuyYeuCau = async () => {
    try {
      setLoading(true);
      const response = await UserService.huyYeuCauMuonPhong(selectedYeuCau.maYeuCau);
      
      if (onSuccess) onSuccess(response.data.message || "Đã hủy yêu cầu mượn phòng thành công!");
      setShowXacNhanHuyModal(false);
      
      // Chuyển sang tab yêu cầu và cập nhật dữ liệu
      setActiveTab("requests");
      
      // Đảm bảo làm mới dữ liệu sau khi hủy yêu cầu
      if (onRefresh) {
        // Đợi để modal đóng hoàn tất
        setTimeout(() => {
          onRefresh();
        }, 300);
      }
      
      setLoading(false);
    } catch (error) {
      if (onError) onError(error.response?.data?.message || error.message);
      setLoading(false);
    }
  };

  const handleMuonPhongNangCaoSubmit = async (e) => {
    e.preventDefault();
    if (!validateAdvancedBookingTime()) {
      return;
    }

    try {
      setLoadingNangCao(true);
      const formData = {
        ...muonPhongNangCaoForm,
        thoiGianMuon: muonPhongNangCaoForm.thoiGianMuon.toISOString(),
        thoiGianTra: muonPhongNangCaoForm.thoiGianTra.toISOString(),
        thietBiYeuCau: muonPhongNangCaoForm.thietBiYeuCau.length > 0 ? muonPhongNangCaoForm.thietBiYeuCau : undefined
      };

      let response;
      if (isGiangVien) {
        response = await UserService.yeuCauMuonPhongGV(formData);
      } else {
        response = await UserService.yeuCauMuonPhong(formData);
      }
      
      if (onSuccess) onSuccess(response.data.message || "Đã gửi yêu cầu mượn phòng thành công!");
      
      // Reset form and close modal
      resetAdvancedForm();
      setShowMuonPhongNangCaoModal(false);
      
      // Chuyển sang tab "requests"
      setActiveTab("requests");
      
      // Cập nhật lại dữ liệu
      if (onRefresh) {
        // Chờ một chút để đảm bảo modal đóng hoàn tất
        setTimeout(() => {
          onRefresh();
        }, 300);
      }
      
      setLoadingNangCao(false);
    } catch (error) {
      if (onError) onError(error.response?.data?.message || error.message);
      setLoadingNangCao(false);
    }
  };

  const handleMuonPhongNangCaoFormChange = (e) => {
    const { name, value } = e.target;
    setMuonPhongNangCaoForm(prev => ({ ...prev, [name]: value }));
  };

  const handleTimPhongTrong = async () => {
    try {
      if (!muonPhongNangCaoForm.thoiGianMuon || !muonPhongNangCaoForm.thoiGianTra || !muonPhongNangCaoForm.soChoDat) {
        if (onError) onError("Vui lòng nhập đủ thông tin tìm kiếm");
        return;
      }
      
      const now = new Date();
      if (muonPhongNangCaoForm.thoiGianMuon < now) {
        if (onError) onError("Thời gian mượn phải là thời gian trong tương lai");
        return;
      }
      
      if (muonPhongNangCaoForm.thoiGianTra <= muonPhongNangCaoForm.thoiGianMuon) {
        if (onError) onError("Thời gian trả phải sau thời gian mượn");
        return;
      }
      
      if (muonPhongNangCaoForm.thoiGianMuon.toDateString() !== muonPhongNangCaoForm.thoiGianTra.toDateString()) {
        if (onError) onError("Thời gian mượn và trả phải trong cùng một ngày");
        return;
      }

      setLoadingTimPhong(true);
      
      try {
        const response = await UserService.timPhongTrong(
          muonPhongNangCaoForm.thoiGianMuon.toISOString(),
          muonPhongNangCaoForm.thoiGianTra.toISOString(),
          muonPhongNangCaoForm.soChoDat,
          muonPhongNangCaoForm.loaiPhong,
          muonPhongNangCaoForm.thietBiYeuCau.length > 0 ? muonPhongNangCaoForm.thietBiYeuCau : undefined
        );
        
        setPhongTrongList(response.data.phongTrongList || []);
        setGoiYPhongGanNhat(response.data.goiYPhongGanNhat || []);
        setLoadingTimPhong(false);
      } catch (apiError) {
        console.error("API error:", apiError);
        if (onError) onError(apiError.response?.data?.message || apiError.message || "Có lỗi xảy ra khi tìm phòng trống");
        setLoadingTimPhong(false);
      }
      
    } catch (error) {
      if (onError) onError(error.response?.data?.message || error.message || "Có lỗi xảy ra khi tìm phòng trống");
      setLoadingTimPhong(false);
    }
  };

  const chonGoiY = (goiY) => {
    setMuonPhongNangCaoForm(prev => ({
      ...prev,
      maPhong: goiY.phong.maPhong,
      thoiGianMuon: new Date(goiY.thoiGianMuonGoiY),
      thoiGianTra: new Date(goiY.thoiGianTraGoiY)
    }));
    
    setPhongTrongList([goiY.phong]);
    setGoiYPhongGanNhat([]);
  };

  const resetAdvancedForm = () => {
    setMuonPhongNangCaoForm({
      soChoDat: "",
      loaiPhong: "",
      thoiGianMuon: getDefaultBookingTime(),
      thoiGianTra: getDefaultReturnTime(getDefaultBookingTime()),
      maPhong: "",
      mucDich: "",
      thietBiYeuCau: [] // Make sure this is reset
    });
    setPhongTrongList([]);
    setGoiYPhongGanNhat([]);
  };

  const validateAdvancedBookingTime = () => {
    if (!muonPhongNangCaoForm.maPhong || !muonPhongNangCaoForm.soChoDat || 
        !muonPhongNangCaoForm.thoiGianMuon || !muonPhongNangCaoForm.thoiGianTra || 
        !muonPhongNangCaoForm.mucDich) {
      if (onError) onError("Vui lòng điền đầy đủ thông tin mượn phòng");
      return false;
    }

    const now = new Date();
    if (muonPhongNangCaoForm.thoiGianMuon < now) {
      if (onError) onError("Thời gian mượn phải là thời gian trong tương lai");
      return false;
    }
    
    if (muonPhongNangCaoForm.thoiGianTra <= muonPhongNangCaoForm.thoiGianMuon) {
      if (onError) onError("Thời gian trả phải sau thời gian mượn");
      return false;
    }
    
    if (muonPhongNangCaoForm.thoiGianMuon.toDateString() !== muonPhongNangCaoForm.thoiGianTra.toDateString()) {
      if (onError) onError("Thời gian mượn và trả phải trong cùng một ngày");
      return false;
    }
    
    return true;
  };

  return (
    <Row className="mt-3">
      <Col md={12}>
        <Card className="mb-4">
          <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
            <Card.Header>
              <Nav variant="tabs" className="card-header-tabs">
                <Nav.Item>
                  <Nav.Link eventKey="register">Đăng ký mượn phòng</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="requests">Yêu cầu mượn phòng</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="history">Lịch sử mượn phòng</Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body>
              <Tab.Content>
                {/* Tab Đăng ký mượn phòng */}
                <Tab.Pane eventKey="register">
                  <Form onSubmit={handleMuonPhongSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Số chỗ cần đặt <span className="text-danger">*</span></Form.Label>
                          <Form.Control
                            type="number"
                            name="soChoDat"
                            value={muonPhongForm.soChoDat}
                            onChange={handleFormChange}
                            placeholder="Nhập số người tham gia"
                            min="1"
                            required
                            disabled={loading}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Chọn phòng</Form.Label>
                          <Form.Select 
                            name="maPhong" 
                            value={muonPhongForm.maPhong} 
                            onChange={handleFormChange} 
                            required
                            disabled={loading || !muonPhongForm.soChoDat || isNaN(parseInt(muonPhongForm.soChoDat)) || parseInt(muonPhongForm.soChoDat) <= 0}
                          >
                            <option value="">-- Chọn phòng --</option>
                            {getFilteredRooms().map(phong => (
                              <option key={phong.maPhong} value={phong.maPhong}>
                                {phong.maPhong} - {phong.loaiPhong} (Sức chứa: {phong.sucChua})
                              </option>
                            ))}
                          </Form.Select>
                          {(!muonPhongForm.soChoDat || isNaN(parseInt(muonPhongForm.soChoDat)) || parseInt(muonPhongForm.soChoDat) <= 0) && (
                            <Form.Text className="text-warning">
                              Vui lòng nhập số chỗ cần đặt trước khi chọn phòng
                            </Form.Text>
                          )}
                          {muonPhongForm.soChoDat && getFilteredRooms().length === 0 && (
                            <Form.Text className="text-danger">
                              Không có phòng nào đủ sức chứa cho {muonPhongForm.soChoDat} người
                            </Form.Text>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Thời gian mượn</Form.Label>
                          <DatePicker
                            selected={muonPhongForm.thoiGianMuon}
                            onChange={handleBookingTimeChange}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={timeIntervals}
                            filterTime={filterTime}
                            dateFormat="dd/MM/yyyy HH:mm"
                            minDate={new Date()}
                            maxDate={getMaxBookingDate()}
                            placeholderText="Chọn thời gian mượn"
                            className="form-control"
                            required
                            disabled={loading}
                          />
                          <Form.Text className="text-muted">
                            Chỉ có thể đặt phòng trong vòng 7 ngày từ hiện tại
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Thời gian trả</Form.Label>
                          <DatePicker
                            selected={muonPhongForm.thoiGianTra}
                            onChange={(date) => setMuonPhongForm(prev => ({ ...prev, thoiGianTra: date }))}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={timeIntervals}
                            filterTime={filterReturnTime}
                            dateFormat="dd/MM/yyyy HH:mm"
                            minDate={muonPhongForm.thoiGianMuon}
                            placeholderText={muonPhongForm.thoiGianMuon ? "Chọn thời gian trả" : "Chọn thời gian mượn trước"}
                            className="form-control"
                            disabled={!muonPhongForm.thoiGianMuon || loading}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-3">
                      <Form.Label>Thiết bị yêu cầu</Form.Label>
                      {loadingThietBi ? (
                        <div className="text-center py-3">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                          </div>
                          <p className="mt-2">Đang tải dữ liệu thiết bị...</p>
                        </div>
                      ) : (
                        <>
                          <div className="d-flex flex-wrap gap-3">
                            {thietBiOptions.map((option) => (
                              <Form.Check
                                key={`thietbi-${option.value}`}
                                type="checkbox"
                                id={`thietbi-${option.value}`}
                                label={option.label}
                                checked={muonPhongForm.thietBiYeuCau.includes(option.value)}
                                onChange={(e) => {
                                  const updatedThietBi = e.target.checked
                                    ? [...muonPhongForm.thietBiYeuCau, option.value]
                                    : muonPhongForm.thietBiYeuCau.filter(item => item !== option.value);
                                  setMuonPhongForm(prev => ({ ...prev, thietBiYeuCau: updatedThietBi }));
                                }}
                                disabled={loading}
                              />
                            ))}
                          </div>
                          <Form.Text className="text-muted">
                            Chọn các thiết bị cần thiết cho phòng học
                          </Form.Text>
                        </>
                      )}
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Mục đích</Form.Label>
                      <Form.Control 
                        as="textarea" 
                        rows={3} 
                        name="mucDich" 
                        value={muonPhongForm.mucDich} 
                        onChange={handleFormChange} 
                        required 
                        disabled={loading}
                      />
                    </Form.Group>
                    <div className="d-flex gap-2">
                      <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? "Đang gửi..." : "Gửi yêu cầu"}
                      </Button>
                      <Button 
                        variant="outline-primary" 
                        type="button" 
                        disabled={loading}
                        onClick={() => setShowMuonPhongNangCaoModal(true)}
                      >
                        Mượn phòng nâng cao
                      </Button>
                    </div>
                  </Form>
                </Tab.Pane>
                
                {/* Tab Yêu cầu mượn phòng */}
                <Tab.Pane eventKey="requests">
                  <div className="table-scrollable">
                    <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Mã YC</th>
                        <th>Phòng</th>
                        <th>Thời gian mượn</th>
                        <th>Thời gian trả</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yeuCauMuonPhong && yeuCauMuonPhong.length > 0 ? 
                        yeuCauMuonPhong
                          .filter(yc => ['DANGXULY', 'DADUYET', 'KHONGDUOCDUYET'].includes(yc.trangThai))
                          .map(yc => (
                          <tr key={yc.maYeuCau}>
                            <td>{yc.maYeuCau}</td>
                            <td>{yc.phong?.maPhong}</td>
                            <td>{formatDate(yc.thoiGianMuon)}</td>
                            <td>{formatDate(yc.thoiGianTra)}</td>
                            <td>
                              <Badge bg={
                                yc.trangThai === 'DADUYET' ? 'success' : 
                                yc.trangThai === 'DANGXULY' ? 'warning' : 
                                'danger'
                              }>
                                {yc.trangThai === 'DANGXULY' ? 'Đang xử lý' :
                                 yc.trangThai === 'DADUYET' ? 'Đã duyệt' :
                                 'Không được duyệt'}
                              </Badge>
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleXemChiTiet(yc)}
                                >
                                  Xem chi tiết
                                </Button>
                                {yc.trangThai != 'KHONGDUOCDUYET' && !yc.daMuon && new Date(yc.thoiGianMuon) > new Date() && (
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedYeuCau(yc);
                                      setShowXacNhanHuyModal(true);
                                    }}
                                  >
                                    Hủy yêu cầu
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan="6" className="text-center">Chưa có yêu cầu mượn phòng</td></tr>
                        )}
                    </tbody>
                  </Table>
                  </div>
                  {yeuCauMuonPhong && yeuCauMuonPhong.filter(yc => yc.trangThai === 'DADUYET' && !yc.thoiGianTra).length > 0 && (
                    <div className="mt-3">
                      <h5>Trả phòng</h5>
                      <div className="d-flex flex-wrap gap-2">
                        {yeuCauMuonPhong
                          .filter(yc => yc.trangThai === 'DADUYET' && !yc.thoiGianTra)
                          .map(yc => (
                            <Button 
                              key={yc.maYeuCau}
                              variant="outline-primary" 
                              size="sm" 
                              onClick={() => handleTraPhong(yc.maYeuCau)}
                              disabled={loading}
                              className="mb-2"
                            >
                              Trả phòng {yc.phong?.maPhong} (Mã YC: {yc.maYeuCau})
                            </Button>
                          ))
                        }
                      </div>
                    </div>
                  )}
                </Tab.Pane>
                
                {/* Tab Lịch sử mượn phòng */}
                <Tab.Pane eventKey="history">
                  <div className="table-scrollable">
                    <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Mã YC</th>
                        <th>Phòng</th>
                        <th>Thời gian mượn</th>
                        <th>Thời gian trả</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lichSuMuonPhong && lichSuMuonPhong.length > 0 ? 
                        lichSuMuonPhong.map(ls => (
                          <tr key={ls.maYeuCau}>
                            <td>{ls.maYeuCau}</td>
                            <td>{ls.maPhong}</td>
                            <td>{formatDate(ls.thoiGianMuon)}</td>
                            <td>{formatDate(ls.thoiGianTra)}</td>
                            <td>
                              <Badge bg={
                                ls.thoiGianTra === null ? 'warning' :
                                ls.trangThaiTra === 'DungHan' ? 'success' :
                                ls.trangThaiTra === 'TreHan' ? 'danger' : 'dark'
                              }>
                                {ls.thoiGianTra === null ? 'Chưa trả' :
                                 ls.trangThaiTra === 'DungHan' ? 'Đúng hạn' :
                                 ls.trangThaiTra === 'TreHan' ? 'Trễ hạn' : 'Đã trả'}
                              </Badge>
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleXemChiTiet(ls)}
                                >
                                  Xem chi tiết
                                </Button>
                                {ls.thoiGianTra === null && (
                                  <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={() => handleXacNhanTraPhong(ls)}
                                  >
                                    Trả phòng
                                  </Button>
                                )}
                                {ls.thoiGianTra !== null && (
                                  <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={() => openPhanHoiModal(ls)}
                                  >
                                    {isDaDanhGia(ls.maYeuCau) ? "Chỉnh sửa đánh giá" : "Đánh giá"}
                                  </Button>
                                )}
                                {ls.thoiGianTra === null && !isDaBaoCao(ls.maYeuCau) && (
                                  <Button
                                    variant="outline-warning"
                                    size="sm"
                                    onClick={() => handleBaoSuCo(ls)}
                                  >
                                    Báo sự cố
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan="6" className="text-center">Chưa có lịch sử mượn phòng</td></tr>
                        )}
                    </tbody>
                  </Table>
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </Card.Body>
          </Tab.Container>
        </Card>
      </Col>
      
      {/* Modal Phản hồi */}
      <Modal show={showPhanHoiModal} onHide={() => {
        setShowPhanHoiModal(false);
        setIsEditingFeedback(false);
        setExistingFeedback(null);
      }} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{isEditingFeedback ? "Chỉnh sửa đánh giá" : "Đánh giá phòng học"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handlePhanHoiSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Phòng</Form.Label>
              <Form.Control 
                type="text" 
                value={selectedYeuCau?.phong?.maPhong || selectedYeuCau?.maPhong || ''} 
                disabled 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Đánh giá (1-5)</Form.Label>
              <Form.Control 
                type="number" 
                min="1" 
                max="5" 
                name="danhGia" 
                value={phanHoiForm.danhGia} 
                onChange={handlePhanHoiFormChange} 
                required 
                disabled={loading}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nhận xét</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                name="nhanXet" 
                value={phanHoiForm.nhanXet} 
                onChange={handlePhanHoiFormChange} 
                disabled={loading}
              />
            </Form.Group>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowPhanHoiModal(false)}>
                Hủy
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : (isEditingFeedback ? 'Cập nhật đánh giá' : 'Gửi đánh giá')}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Incident Report Modal */}
      <Modal 
        show={showSuCoModal} 
        onHide={() => setShowSuCoModal(false)}
        centered
      >
        <Modal.Header closeButton className="modal-header">
          <Modal.Title>
            Báo cáo sự cố
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          <Form onSubmit={handleSuCoSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Phòng</Form.Label>
              <Form.Control 
                type="text" 
                value={selectedYeuCau?.phong?.maPhong || selectedYeuCau?.maPhong || ''} 
                disabled 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mã yêu cầu</Form.Label>
              <Form.Control 
                type="text" 
                value={selectedYeuCau?.maYeuCau || ''} 
                disabled 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mô tả sự cố <span className="text-danger">*</span></Form.Label>
              <Form.Control 
                as="textarea" 
                rows={4} 
                name="moTa" 
                value={suCoForm.moTa} 
                onChange={handleSuCoFormChange} 
                required 
                placeholder="Vui lòng mô tả chi tiết sự cố bạn gặp phải..."
                disabled={loading}
              />
            </Form.Group>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowSuCoModal(false)}>
                Hủy
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Gửi báo cáo'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Chi tiết yêu cầu mượn phòng Modal */}
      <Modal 
        show={showChiTietModal} 
        onHide={() => setShowChiTietModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="modal-header">
          <Modal.Title>
            Chi tiết yêu cầu mượn phòng
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          <Row>
            <Col md={6}>
              <div className="mb-3">
                <strong>Mã yêu cầu:</strong> {selectedYeuCau?.maYeuCau}
              </div>
              <div className="mb-3">
                <strong>Phòng:</strong> {selectedYeuCau?.phong} 
                {selectedYeuCau?.phong && ` - ${selectedYeuCau.loaiPhong}`}
                {/* {selectedYeuCau?.phong?.sucChua && ` (Sức chứa: ${selectedYeuCau.phong.sucChua})`} */}
              </div>
              <div className="mb-3">
                <strong>Người mượn:</strong> {selectedYeuCau?.nguoiMuon || ''}
              </div>
              <div className="mb-3">
                <strong>Thời gian mượn:</strong> {selectedYeuCau ? formatDate(selectedYeuCau.thoiGianMuon) : ''}
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <strong>Thời gian trả:</strong> {selectedYeuCau ? formatDate(selectedYeuCau.thoiGianTra) : ''}
              </div>
              <div className="mb-3">
                <strong>Trạng thái:</strong>{' '}
                <Badge bg={
                  selectedYeuCau?.trangThai === 'DADUYET' ? 'success' : 
                  selectedYeuCau?.trangThai === 'DANGXULY' ? 'warning' : 
                  'danger'
                }>
                  {selectedYeuCau?.trangThai === 'DANGXULY' ? 'Đang xử lý' :
                   selectedYeuCau?.trangThai === 'DADUYET' ? 'Đã duyệt' :
                   'Không được duyệt'}
                </Badge>
              </div>
              {selectedYeuCau?.nguoiDuyet && (
              <div className="mb-3">
                <strong>Người duyệt:</strong> {selectedYeuCau.nguoiDuyet || ''}
              </div>
              )}
            </Col>
          </Row>
          <div className="mb-3">
            <strong>Mục đích:</strong>
            <p className="mt-2 p-3 bg-light rounded">
              {selectedYeuCau?.mucDich || 'Không có mục đích được cung cấp.'}
            </p>
          </div>
          <div className="mb-3">
            <strong>Lý do:</strong>
            <p className="mt-2 p-3 bg-light rounded">
              {selectedYeuCau?.lyDo || 'Không có lý do được cung cấp.'}
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowChiTietModal(false)}>
            Đóng
          </Button>
          {selectedYeuCau?.trangThai === 'DADUYET' && !selectedYeuCau?.thoiGianTra && (
            <Button 
              variant="primary" 
              onClick={() => {
                setShowChiTietModal(false);
                handleTraPhong(selectedYeuCau.maYeuCau);
              }}
              disabled={loading}
            >
              Trả phòng
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Modal xác nhận trả phòng */}
      <Modal 
        show={showXacNhanTraModal} 
        onHide={() => setShowXacNhanTraModal(false)}
        centered
      >
        <Modal.Header closeButton className="modal-header">
          <Modal.Title>
            Xác nhận trả phòng
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          <p>Bạn có chắc chắn muốn trả phòng <strong>{selectedYeuCau?.phong?.maPhong || selectedYeuCau?.maPhong}</strong> không?</p>
          <p>Thời gian trả sẽ được cập nhật là thời gian hiện tại.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowXacNhanTraModal(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={confirmTraPhong}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận trả phòng'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal xác nhận hủy yêu cầu */}
      <Modal 
        show={showXacNhanHuyModal} 
        onHide={() => setShowXacNhanHuyModal(false)}
        centered
      >
        <Modal.Header closeButton className="modal-header">
          <Modal.Title>
            Xác nhận hủy yêu cầu
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          <p>Bạn có chắc chắn muốn hủy yêu cầu mượn phòng <strong>{selectedYeuCau?.phong?.maPhong || selectedYeuCau?.maPhong}</strong> không?</p>
          <p>Thời gian mượn: {selectedYeuCau ? formatDate(selectedYeuCau.thoiGianMuon) : ''}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowXacNhanHuyModal(false)}>
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={handleHuyYeuCau}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận hủy'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal mượn phòng nâng cao */}
      <Modal 
        show={showMuonPhongNangCaoModal} 
        onHide={() => setShowMuonPhongNangCaoModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="modal-header">
          <Modal.Title>
            Mượn phòng nâng cao
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          <Form onSubmit={handleMuonPhongNangCaoSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Số chỗ cần đặt <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="soChoDat"
                    value={muonPhongNangCaoForm.soChoDat}
                    onChange={handleMuonPhongNangCaoFormChange}
                    placeholder="Nhập số người tham gia"
                    min="1"
                    required
                    disabled={loadingNangCao}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Loại phòng</Form.Label>
                  <Form.Select
                    name="loaiPhong"
                    value={muonPhongNangCaoForm.loaiPhong}
                    onChange={handleMuonPhongNangCaoFormChange}
                    disabled={loadingNangCao}
                  >
                    <option value="">Tất cả loại phòng</option>
                    {loaiPhongOptions.map((loai, index) => (
                      <option key={index} value={loai === "Phòng học" ? "HOC" : "THUCHANH"}>
                        {loai}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Thời gian mượn <span className="text-danger">*</span></Form.Label>
                  <DatePicker
                    selected={muonPhongNangCaoForm.thoiGianMuon || getDefaultBookingTime()}
                    onChange={(date) => setMuonPhongNangCaoForm(prev => ({ 
                      ...prev, 
                      thoiGianMuon: date,
                      // Tự động cập nhật thời gian trả là 2 giờ sau thời gian mượn
                      thoiGianTra: getDefaultReturnTime(date)
                    }))}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={timeIntervals}
                    filterTime={filterTime}
                    dateFormat="dd/MM/yyyy HH:mm"
                    minDate={new Date()}
                    maxDate={getMaxBookingDate()}
                    placeholderText="Chọn thời gian mượn"
                    className="form-control"
                    required
                    disabled={loadingNangCao}
                  />
                  <Form.Text className="text-muted">
                    Chỉ có thể đặt phòng trong vòng 7 ngày từ hiện tại
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Thời gian trả <span className="text-danger">*</span></Form.Label>
                  <DatePicker
                    selected={muonPhongNangCaoForm.thoiGianTra}
                    onChange={(date) => setMuonPhongNangCaoForm(prev => ({ ...prev, thoiGianTra: date }))}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={timeIntervals}
                    filterTime={filterReturnTimeNangCao}
                    dateFormat="dd/MM/yyyy HH:mm"
                    minDate={muonPhongNangCaoForm.thoiGianMuon}
                    placeholderText={muonPhongNangCaoForm.thoiGianMuon ? "Chọn thời gian trả" : "Chọn thời gian mượn trước"}
                    className="form-control"
                    disabled={!muonPhongNangCaoForm.thoiGianMuon || loadingNangCao}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Section for device selection in advanced form */}
            <div className="mb-3">
              <Form.Label>Thiết bị yêu cầu</Form.Label>
              {loadingThietBi ? (
                <div className="text-center py-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                  <p className="mt-2">Đang tải dữ liệu thiết bị...</p>
                </div>
              ) : (
                <>
                  <div className="d-flex flex-wrap gap-3">
                    {thietBiOptions.map((option) => (
                      <Form.Check
                        key={`advanced-${option.value}`}
                        type="checkbox"
                        id={`advanced-thietbi-${option.value}`}
                        label={option.label}
                        checked={muonPhongNangCaoForm.thietBiYeuCau.includes(option.value)}
                        onChange={(e) => {
                          const updatedThietBi = e.target.checked
                            ? [...muonPhongNangCaoForm.thietBiYeuCau, option.value]
                            : muonPhongNangCaoForm.thietBiYeuCau.filter(item => item !== option.value);
                          setMuonPhongNangCaoForm(prev => ({ ...prev, thietBiYeuCau: updatedThietBi }));
                        }}
                        disabled={loadingNangCao}
                      />
                    ))}
                  </div>
                  <Form.Text className="text-muted">
                    Chọn các thiết bị cần thiết cho phòng học
                  </Form.Text>
                </>
              )}
            </div>

            <Button 
              variant="primary" 
              type="button" 
              className="mb-4" 
              disabled={!muonPhongNangCaoForm.thoiGianMuon || !muonPhongNangCaoForm.thoiGianTra || !muonPhongNangCaoForm.soChoDat || loadingNangCao}
              onClick={handleTimPhongTrong}
            >
              {loadingTimPhong ? "Đang tìm phòng..." : "Tìm phòng trống"}
            </Button>

            {phongTrongList && phongTrongList.length > 0 && (
              <div className="mb-3">
                <Form.Group>
                  <Form.Label>Chọn phòng trống</Form.Label>
                  <Form.Select
                    name="maPhong"
                    value={muonPhongNangCaoForm.maPhong}
                    onChange={handleMuonPhongNangCaoFormChange}
                    required
                    disabled={loadingNangCao}
                  >
                    <option value="">-- Chọn phòng --</option>
                    {phongTrongList.map(phong => (
                      <option key={phong.maPhong} value={phong.maPhong}>
                        {phong.maPhong} - {phong.loaiPhong} (Sức chứa: {phong.sucChua})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
            )}

            {phongTrongList && phongTrongList.length === 0 && goiYPhongGanNhat && goiYPhongGanNhat.length > 0 && (
              <div className="mb-3">
                <Alert variant="warning">
                  <Alert.Heading>Không có phòng trống vào thời gian đã chọn</Alert.Heading>
                  <p>Dưới đây là một số gợi ý thời gian gần nhất có phòng trống:</p>
                  <hr />
                  <div className="mt-3">
                    {goiYPhongGanNhat.map((goiY, index) => (
                      <Card key={index} className="mb-2 room-card">
                        <Card.Body>
                          <Card.Title>{goiY.phong.maPhong} - {goiY.phong.loaiPhong}</Card.Title>
                          <Card.Text className="mb-1">Sức chứa: {goiY.phong.sucChua} người</Card.Text>
                          <Card.Text className="mb-1">Thời gian trống: {formatDate(goiY.thoiGianMuonGoiY)} - {formatDate(goiY.thoiGianTraGoiY)}</Card.Text>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            onClick={() => chonGoiY(goiY)}
                          >
                            Chọn khung giờ này
                          </Button>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                </Alert>
              </div>
            )}

            <Form.Group className="mb-4">
              <Form.Label>Mục đích</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                name="mucDich" 
                value={muonPhongNangCaoForm.mucDich} 
                onChange={handleMuonPhongNangCaoFormChange} 
                required 
                disabled={loadingNangCao}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button 
                variant="secondary" 
                onClick={() => setShowMuonPhongNangCaoModal(false)}
                disabled={loadingNangCao}
              >
                Hủy
              </Button>
              <Button 
                variant="primary" 
                type="submit" 
                disabled={loadingNangCao || !muonPhongNangCaoForm.maPhong || !muonPhongNangCaoForm.soChoDat || !muonPhongNangCaoForm.thoiGianMuon || !muonPhongNangCaoForm.thoiGianTra || !muonPhongNangCaoForm.mucDich}
              >
                {loadingNangCao ? "Đang gửi..." : "Gửi yêu cầu"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Row>
  );
};

export default MuonPhongManager; 