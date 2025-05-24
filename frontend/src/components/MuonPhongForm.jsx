// Xử lý khi form được gửi
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Kiểm tra dữ liệu hợp lệ
  if (!validateForm()) {
    return;
  }
  
  setIsSubmitting(true);
  setMessage("");
  
  try {
    // Chuẩn bị dữ liệu gửi đi
    const requestData = {
      maPhong: selectedPhong,
      thoiGianMuon: new Date(formData.ngayMuon + "T" + formData.gioMuon),
      thoiGianTra: new Date(formData.ngayTra + "T" + formData.gioTra),
      mucDich: formData.mucDich
    };
    
    // Gọi API để gửi yêu cầu mượn phòng
    await userService.yeuCauMuonPhong(requestData);
    
    // Thông báo thành công và reset form
    setMessage("Đã gửi yêu cầu mượn phòng thành công!");
    setMessageType("success");
    resetForm();
    
    // Cập nhật lại danh sách yêu cầu nếu cần
    if (onSubmitSuccess) {
      onSubmitSuccess();
    }
  } catch (error) {
    console.error("Lỗi khi gửi yêu cầu:", error);
    
    if (error.response && error.response.status === 409) {
      // Xử lý lỗi xung đột lịch trình
      setMessageType("danger");
      setMessage(error.response.data.message || "Xung đột lịch trình. Vui lòng chọn thời gian khác.");
    } else {
      setMessageType("danger");
      setMessage(error.response?.data?.message || "Đã có lỗi xảy ra khi gửi yêu cầu mượn phòng.");
    }
  } finally {
    setIsSubmitting(false);
  }
}; 