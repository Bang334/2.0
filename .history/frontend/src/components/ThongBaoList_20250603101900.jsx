import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Row, Col, Nav, Table, Button, Badge, Modal, Card, Pagination, Tab, Tabs } from "react-bootstrap";
import { format } from 'date-fns';
import UserService from "../services/user.service";
import "../css/ThongBaoList.css";
import { FaInbox, FaPaperPlane, FaTrash, FaEye, FaExclamationTriangle } from "react-icons/fa";
import { toast } from "react-toastify";

const ThongBaoList = forwardRef(({ isGiangVien = false }, ref) => {
  const [thongBaoNhanList, setThongBaoNhanList] = useState([]);
  const [thongBaoGuiList, setThongBaoGuiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("nhan");
  const [activeThongBaoTab, setActiveThongBaoTab] = useState("nhan");
  const [showThongBaoDetailModal, setShowThongBaoDetailModal] = useState(false);
  const [showThongBaoDaGuiDetailModal, setShowThongBaoDaGuiDetailModal] = useState(false);
  const [selectedThongBao, setSelectedThongBao] = useState(null);
  const [selectedThongBaoDaGui, setSelectedThongBaoDaGui] = useState(null);
  const [nguoiNhanThongBao, setNguoiNhanThongBao] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [thongBaoToDelete, setThongBaoToDelete] = useState(null);

  useEffect(() => {
    fetchThongBaoNhan();
    fetchThongBaoGui();
  }, [isGiangVien]);

  // Thêm hiển thị thông báo lỗi nếu có
  useEffect(() => {
    if (error) {
      // Auto clear error after 5 seconds
      const timer = setTimeout(() => {
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchThongBaoNhan = async () => {
    try {
      setLoading(true);
      const response = isGiangVien 
        ? await UserService.getThongBaoNhanGV() 
        : await UserService.getThongBaoNhan();
      setThongBaoNhanList(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching thông báo nhận:", error);
      setError("Không thể tải thông báo đã nhận");
      setLoading(false);
    }
  };

  const fetchThongBaoGui = async () => {
    try {
      setLoading(true);
      const response = isGiangVien 
        ? await UserService.getThongBaoGuiGV() 
        : await UserService.getThongBaoGui();
      
      // Kiểm tra từng thông báo để đảm bảo dữ liệu chính xác
      response.data.forEach(tb => {
        console.log(`Thông báo ID ${tb.id || tb.idTB}: Người nhận = ${tb.soNguoiNhan}, Đã đọc = ${tb.soNguoiDaDoc}`);
      });
      
      setThongBaoGuiList(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching thông báo gửi:", error);
      setError("Không thể tải thông báo đã gửi");
      setLoading(false);
    }
  };

  const handleDanhDauDaDoc = async (maThongBao) => {
    // Kiểm tra nếu maThongBao không tồn tại
    if (!maThongBao) {
      console.error("Không thể đánh dấu đã đọc: ID thông báo không hợp lệ");
      setError("Không thể đánh dấu đã đọc: ID thông báo không hợp lệ");
      return;
    }

    try {
      setLoading(true);
      console.log(`Đang đánh dấu đã đọc thông báo với ID: ${maThongBao}`);
      const response = isGiangVien 
        ? await UserService.danhDauDaDocGV(maThongBao) 
        : await UserService.danhDauDaDoc(maThongBao);
      
      // Cập nhật lại trạng thái thông báo trong danh sách
      // CHỈ cập nhật thông báo với ID tương ứng
      setThongBaoNhanList(prev => 
        prev.map(tb => {
          // Xác định ID của thông báo hiện tại
          const tbId = tb.maThongBao || tb.id;
          // Chỉ cập nhật thông báo có ID trùng khớp
          return tbId === maThongBao
            ? { ...tb, trangThai: "DADOC" } 
            : tb;
        })
      );
      
      setLoading(false);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      setError("Không thể đánh dấu đã đọc");
      setLoading(false);
    }
  };

  // Hiển thị modal xác nhận xóa thông báo
  const confirmDeleteThongBao = (thongBao) => {
    setThongBaoToDelete(thongBao);
    setShowDeleteConfirmModal(true);
  };

  // Xử lý xóa thông báo
  const handleXoaThongBao = async (maThongBao) => {
    // Kiểm tra nếu maThongBao không tồn tại
    if (!maThongBao) {
      console.error("Không thể xóa: ID thông báo không hợp lệ");
      setError("Không thể xóa: ID thông báo không hợp lệ");
      return;
    }

    try {
      setDeleting(true);
      console.log(`Đang xóa thông báo với ID: ${maThongBao}`);
      
      const response = isGiangVien 
        ? await UserService.xoaThongBaoGV(maThongBao) 
        : await UserService.xoaThongBao(maThongBao);
      
      // Cập nhật lại danh sách thông báo (loại bỏ thông báo đã xóa)
      setThongBaoNhanList(prev => 
        prev.filter(tb => {
          const tbId = tb.maThongBao || tb.id;
          return tbId !== maThongBao;
        })
      );
      
      toast.success("Đã xóa thông báo thành công");
      setDeleting(false);
      setShowDeleteConfirmModal(false);
    } catch (error) {
      console.error("Error deleting notification:", error);
      setError("Không thể xóa thông báo: " + (error.response?.data?.message || error.message));
      toast.error("Không thể xóa thông báo");
      setDeleting(false);
    }
  };

  // Utility
  const formatDate = (dateString) => dateString ? format(new Date(dateString), 'dd/MM/yyyy HH:mm') : '';

  const openThongBaoDetail = async (thongBao) => {
    try {
      setSelectedThongBao(thongBao);
      setShowThongBaoDetailModal(true);
      
      // Xác định ID thông báo (có thể là maThongBao hoặc id)
      const thongBaoId = thongBao.maThongBao || thongBao.id;
      
      // Kiểm tra ID thông báo có tồn tại không
      if (!thongBaoId) {
        console.error("Không thể đánh dấu đã đọc: ID thông báo không hợp lệ");
        return;
      }
      
      // Luôn đánh dấu thông báo là đã đọc khi mở xem chi tiết, bất kể trạng thái hiện tại
      // Cập nhật giao diện ngay lập tức để phản hồi nhanh với người dùng
      if (thongBao.trangThai !== 'DADOC') {
        // Cập nhật UI ngay lập tức để người dùng thấy sự thay đổi
        // CHỈ cập nhật thông báo hiện tại, không phải tất cả
        setThongBaoNhanList(prev => 
          prev.map(tb => {
            // So sánh ID chính xác để chỉ cập nhật đúng thông báo đang xem
            const tbId = tb.maThongBao || tb.id;
            return tbId === thongBaoId 
              ? { ...tb, trangThai: "DADOC" } 
              : tb;
          })
        );
        
        // Gọi API để cập nhật trạng thái trên server
        try {
          console.log(`Đánh dấu đã đọc thông báo với ID: ${thongBaoId}`);
          const response = isGiangVien 
            ? await UserService.danhDauDaDocGV(thongBaoId) 
            : await UserService.danhDauDaDoc(thongBaoId);
          
          console.log("Đã đánh dấu thông báo đã đọc:", response);
        } catch (error) {
          // Nếu API gặp lỗi, log lỗi nhưng vẫn giữ trạng thái đã đọc trên UI
          console.error("Lỗi khi đánh dấu thông báo đã đọc:", error);
        }
      }
    } catch (error) {
      console.error("Lỗi khi mở chi tiết thông báo:", error);
      setError(error?.response?.data?.message || "Không thể mở chi tiết thông báo");
    }
  };

  const closeThongBaoDetail = () => {
    setShowThongBaoDetailModal(false);
    setSelectedThongBao(null);
  };

  const openThongBaoDaGuiDetail = async (thongBao) => {
    try {
      console.log("Chi tiết thông báo:", thongBao);
      
      // Kiểm tra thông báo có tồn tại không
      if (!thongBao) {
        setError("Không thể xem chi tiết: Thông báo không hợp lệ");
        return;
      }
      
      // Xác định ID của thông báo (có thể là id hoặc idTB)
      const thongBaoId = thongBao.id || thongBao.idTB;
      
      if (!thongBaoId) {
        setError("Không thể xem chi tiết: ID thông báo không hợp lệ");
        return;
      }
      
      const response = await UserService.getNguoiNhanThongBao(thongBaoId);
      setNguoiNhanThongBao(response.data);
      setSelectedThongBaoDaGui(thongBao);
      setShowThongBaoDaGuiDetailModal(true);
    } catch (error) {
      console.error("Error fetching notification recipients:", error);
      if (error) {
        setError("Không thể tải danh sách người nhận thông báo: " + (error.response?.data || error.message));
      }
    }
  };
  
  const closeThongBaoDaGuiDetail = () => {
    setShowThongBaoDaGuiDetailModal(false);
    setSelectedThongBaoDaGui(null);
    setNguoiNhanThongBao([]);
  };

  // Công khai phương thức để cập nhật tab
  useImperativeHandle(ref, () => ({
    switchToSentTab: () => {
      setActiveThongBaoTab("gui");
    },
    refreshList: () => {
      fetchThongBaoGui();
    }
  }));

  return (
    <Row>
      <Col>
        <div className="d-flex justify-content-center align-items-center mb-3 mt-3">
          <h4>Thông báo</h4>
        </div>
        
        <Nav variant="tabs" className="mb-3 custom-tabs" activeKey={activeThongBaoTab} onSelect={(k) => setActiveThongBaoTab(k)}>
          <Nav.Item>
            <Nav.Link eventKey="nhan" className="custom-tab-link">
              <FaInbox className="me-2" /> Thông báo đã nhận
              {thongBaoNhanList.filter(tb => tb.trangThai === 'CHUADOC').length > 0 && (
                <Badge pill bg="danger" className="ms-2">
                  {thongBaoNhanList.filter(tb => tb.trangThai === 'CHUADOC').length}
                </Badge>
              )}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="gui" className="custom-tab-link">
              <FaPaperPlane className="me-2" /> Thông báo đã gửi
              {thongBaoGuiList.length > 0 && (
                <Badge pill bg="info" className="ms-2">
                  {thongBaoGuiList.length}
                </Badge>
              )}
            </Nav.Link>
          </Nav.Item>
        </Nav>
        
        {activeThongBaoTab === "nhan" && (
          <div className="notification-container">
            {thongBaoNhanList.length > 0 ? (
              <div className="notification-list">
                {thongBaoNhanList.map(tb => {
                  const isUnread = tb.trangThai === 'CHUADOC';
                  const senderName = tb.thongBaoGui?.nguoiGui?.hoTen ?? "Quản Lý";
                  const senderInitial = senderName.charAt(0).toUpperCase();
                  
                  return (
                    <div key={tb.id} className={`notification-card ${isUnread ? 'unread' : ''}`}>
                      <div className="notification-header">
                        <h5 className="notification-title">{tb.thongBaoGui?.tieuDe}</h5>
                        <div className="notification-time">{formatDate(tb.thongBaoGui?.thoiGian)}</div>
                      </div>
                      <div className="notification-content">
                        <div className="notification-sender">
                          <div className="notification-sender-avatar">
                            {senderInitial}
                          </div>
                          <div>{senderName}</div>
                        </div>
                        <div className="notification-preview">
                          {tb.thongBaoGui?.noiDung || "Không có nội dung"}
                        </div>
                      </div>
                      <div className="notification-footer">
                        <div className="notification-status">
                          <Badge bg={isUnread ? 'warning' : 'success'} className="me-2">
                            {isUnread ? 'Chưa đọc' : 'Đã đọc'}
                          </Badge>
                        </div>
                        <div className="notification-actions">
                          <button 
                            className="notification-btn notification-btn-view"
                            onClick={() => openThongBaoDetail(tb)}
                          >
                            <FaEye /> Xem
                          </button>
                          <button
                            className="notification-btn notification-btn-delete"
                            onClick={() => confirmDeleteThongBao(tb)}
                            disabled={deleting}
                          >
                            <FaTrash /> Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="notification-empty">
                <div className="notification-empty-icon">
                  <FaInbox />
                </div>
                <p>Không có thông báo</p>
              </div>
            )}
          </div>
        )}
        
        {activeThongBaoTab === "gui" && (
          <div className="notification-container">
            {thongBaoGuiList.length > 0 ? (
              <div className="notification-list">
                {thongBaoGuiList.map(tb => (
                  <div key={tb.id || tb.idTB} className="notification-card">
                    <div className="notification-header sent">
                      <h5 className="notification-title">{tb.tieuDe}</h5>
                      <div className="notification-time">{formatDate(tb.thoiGian)}</div>
                    </div>
                    <div className="notification-content">
                      <div className="notification-preview">
                        {tb.noiDung || "Không có nội dung"}
                      </div>
                      <div className="sent-notification-stats">
                        {tb.soNguoiNhan !== undefined && (
                          <div className="recipients-count">
                            <FaInbox size={14} /> 
                            {tb.soNguoiNhan} người nhận
                          </div>
                        )}
                        {tb.soNguoiDaDoc !== undefined && tb.soNguoiNhan !== undefined && (
                          <div className="read-status">
                            <span>{tb.soNguoiDaDoc}/{tb.soNguoiNhan} đã đọc</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="notification-footer">
                      <div className="notification-status">
                        <Badge bg="info">Đã gửi</Badge>
                      </div>
                      <div className="notification-actions">
                        <button 
                          className="notification-btn notification-btn-view"
                          onClick={() => openThongBaoDaGuiDetail(tb)}
                        >
                          <FaEye /> Chi tiết
                        </button>
                      </div>

                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="notification-empty">
                <div className="notification-empty-icon">
                  <FaPaperPlane />
                </div>
                <p>Bạn chưa gửi thông báo nào</p>
              </div>
            )}
          </div>
        )}
      </Col>

      {/* Modal xác nhận xóa thông báo */}
      <Modal 
        show={showDeleteConfirmModal} 
        onHide={() => setShowDeleteConfirmModal(false)}
        centered
        backdrop="static"
        className="delete-confirm-modal"
      >
        <Modal.Header 
          closeButton 
          style={{
            background: 'linear-gradient(135deg, #e53935, #f44336)',
            color: 'white',
            borderBottom: 'none',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px'
          }}
        >
          <Modal.Title>
            <FaExclamationTriangle className="me-2" />
            Xác nhận xóa thông báo
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{padding: '24px'}}>
          <div className="text-center mb-4">
            <div 
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}
            >
              <FaExclamationTriangle size={40} style={{color: '#e53935'}} />
            </div>
            <h5 style={{marginBottom: '16px', fontWeight: '600'}}>Bạn có chắc chắn muốn xóa thông báo này?</h5>
            
            {thongBaoToDelete && (
              <Card 
                className="mb-4 border-0" 
                style={{
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  borderRadius: '10px'
                }}
              >
                <Card.Body className="p-3">
                  <div className="d-flex align-items-center mb-3">
                    <div 
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: '#e3f2fd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px'
                      }}
                    >
                      {(thongBaoToDelete.thongBaoGui?.nguoiGui?.hoTen ?? "Q")[0].toUpperCase()}
                    </div>
                    <div className="text-start">
                      <div className="fw-bold">{thongBaoToDelete.thongBaoGui?.nguoiGui?.hoTen ?? "Quản Lý"}</div>
                      <small className="text-muted">{formatDate(thongBaoToDelete.thongBaoGui?.thoiGian)}</small>
                    </div>
                  </div>
                  
                  <h6 className="text-start mb-0">{thongBaoToDelete.thongBaoGui?.tieuDe}</h6>
                </Card.Body>
              </Card>
            )}
            
            <div 
              className="alert mb-0" 
              style={{
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                borderLeft: '4px solid #ffc107',
                padding: '16px',
                textAlign: 'left'
              }}
            >
              <div className="d-flex align-items-center">
                <FaExclamationTriangle style={{color: '#ffc107', marginRight: '12px'}} />
                <strong>Lưu ý:</strong>
              </div>
              <p className="mb-0 mt-2">Hành động này không thể hoàn tác và thông báo sẽ bị xóa vĩnh viễn!</p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer style={{background: '#f8f9fa', borderTop: '1px solid #eee', justifyContent: 'center', padding: '16px', gap: '12px'}}>
          <Button 
            variant="light" 
            onClick={() => setShowDeleteConfirmModal(false)}
            style={{
              borderRadius: '30px',
              paddingLeft: '24px',
              paddingRight: '24px',
              fontWeight: '500',
              borderColor: '#ddd'
            }}
          >
            Hủy
          </Button>
          <Button 
            variant="danger" 
            onClick={() => handleXoaThongBao(thongBaoToDelete?.id)}
            disabled={deleting}
            style={{
              borderRadius: '30px',
              paddingLeft: '24px',
              paddingRight: '24px',
              fontWeight: '500',
              background: 'linear-gradient(135deg, #e53935, #f44336)',
              border: 'none',
              boxShadow: '0 2px 6px rgba(244, 67, 54, 0.3)'
            }}
          >
            {deleting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Đang xóa...
              </>
            ) : (
              <>
                <FaTrash className="me-2" /> Xóa thông báo
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Thông báo Detail Modal */}
      <Modal 
        show={showThongBaoDetailModal} 
        onHide={closeThongBaoDetail} 
        size="lg"
        centered
      >
        <Modal.Header closeButton style={{
          background: 'linear-gradient(135deg, var(--primary-color), #1565c0)',
          color: 'white',
          borderBottom: 'none'
        }}>
          <Modal.Title>Chi tiết thông báo</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{padding: '24px'}}>
          {selectedThongBao && (
            <div>
              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center" 
                  style={{background: '#f8f9fa', borderBottom: '1px solid #eee'}}>
                  <div className="d-flex align-items-center">
                    {selectedThongBao.thongBaoGui?.nguoiGui?.hoTen && (
                      <div 
                      style={{
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        background: '#e3f2fd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px',
                        color: 'var(--primary-color)',
                        fontWeight: 'bold',
                      }}
                      >
                        {/* {selectedThongBao.thongBaoGui?.nguoiGui?.hoTen.charAt(0).toUpperCase()} */}
                      </div>
                    )}
                    <div>
                      <h5 className="mb-0">{selectedThongBao.thongBaoGui?.nguoiGui?.hoTen || "Quản Lý"}</h5>
                      <small className="text-muted">
                        Gửi cho {selectedThongBao.thongBaoGui?.guiChoLop ? selectedThongBao.thongBaoGui?.lopNhan?.tenLop : "bạn"}
                      </small>
                    </div>
                  </div>
                  <div className="text-muted">
                    <small>{formatDate(selectedThongBao.thongBaoGui?.thoiGian)}</small>
                  </div>
                </Card.Header>
                <Card.Body>
                  <h4 className="mb-3">{selectedThongBao.thongBaoGui?.tieuDe}</h4>
                  <div className="p-3 bg-light rounded mb-3" style={{whiteSpace: 'pre-line'}}>
                    {selectedThongBao.thongBaoGui?.noiDung || "Không có nội dung"}
                  </div>
                  <div className="d-flex justify-content-end">
                    <Badge bg="success">Đã đọc</Badge>
                  </div>
                </Card.Body>
              </Card>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{background: '#f8f9fa', borderTop: '1px solid #eee'}}>
          <Button 
            variant="danger" 
            onClick={() => {
              closeThongBaoDetail();
              if (selectedThongBao?.id) {
                confirmDeleteThongBao(selectedThongBao);
              }
            }}
            style={{
              borderRadius: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              paddingLeft: '20px',
              paddingRight: '20px'
            }}
          >
            <FaTrash /> Xóa thông báo
          </Button>
          <Button 
            variant="secondary" 
            onClick={closeThongBaoDetail}
            style={{
              borderRadius: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              paddingLeft: '20px',
              paddingRight: '20px'
            }}
          >
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Thông báo Đã Gửi Detail Modal */}
      <Modal 
        show={showThongBaoDaGuiDetailModal} 
        onHide={closeThongBaoDaGuiDetail} 
        size="lg"
        centered
      >
        <Modal.Header closeButton style={{
          background: 'linear-gradient(135deg, var(--secondary-color), #43a047)',
          color: 'white',
          borderBottom: 'none'
        }}>
          <Modal.Title>Chi tiết thông báo đã gửi</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{padding: '24px'}}>
          {selectedThongBaoDaGui && (
            <div>
              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-light d-flex align-items-center justify-content-between">
                  <h5 className="mb-0">{selectedThongBaoDaGui.tieuDe}</h5>
                  <small className="text-muted">{formatDate(selectedThongBaoDaGui.thoiGian)}</small>
                </Card.Header>
                <Card.Body>
                  <div className="p-3 bg-light rounded mb-4" style={{whiteSpace: 'pre-line'}}>
                    {selectedThongBaoDaGui.noiDung || "Không có nội dung"}
                  </div>
                  
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <Badge bg="primary" className="p-2 px-3" style={{fontSize: '0.9rem'}}>
                      {nguoiNhanThongBao.danhSachNguoiNhan?.length || 0} người nhận
                    </Badge>
                    
                    <Badge bg="success" className="p-2 px-3" style={{fontSize: '0.9rem'}}>
                      {nguoiNhanThongBao.danhSachNguoiNhan?.filter(n => n.trangThai === 'DADOC').length || 0} đã đọc
                    </Badge>
                    
                    <Badge bg="warning" className="p-2 px-3" style={{fontSize: '0.9rem'}}>
                      {nguoiNhanThongBao.danhSachNguoiNhan?.filter(n => n.trangThai !== 'DADOC').length || 0} chưa đọc
                    </Badge>
                  </div>
                  
                  <h6 className="mb-3">Danh sách người nhận:</h6>
                  
                  <div className="recipient-list">
                    {nguoiNhanThongBao.danhSachNguoiNhan?.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-hover" style={{borderRadius: '8px', overflow: 'hidden'}}>
                          <thead style={{backgroundColor: '#f5f5f5'}}>
                            <tr>
                              <th style={{padding: '12px 16px'}}>Họ tên</th>
                              <th style={{padding: '12px 16px'}}>Vai trò</th>
                              <th style={{padding: '12px 16px'}}>Lớp</th>
                              <th style={{padding: '12px 16px'}}>Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody>
                            {nguoiNhanThongBao.danhSachNguoiNhan.map(nguoiNhan => (
                              <tr key={nguoiNhan.id}>
                                <td style={{padding: '12px 16px'}}>{nguoiNhan.hoTen}</td>
                                <td style={{padding: '12px 16px'}}>{nguoiNhan.vaiTro}</td>
                                <td style={{padding: '12px 16px'}}>{nguoiNhan.maLop || '-'}</td>
                                <td style={{padding: '12px 16px'}}>
                                  <Badge bg={nguoiNhan.trangThai === 'DADOC' ? 'success' : 'warning'} className="p-2 px-3">
                                    {nguoiNhan.trangThai === 'DADOC' ? 'Đã đọc' : 'Chưa đọc'}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="alert alert-info">Không có người nhận</div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{background: '#f8f9fa', borderTop: '1px solid #eee'}}>
          <Button 
            variant="secondary" 
            onClick={closeThongBaoDaGuiDetail}
            style={{
              borderRadius: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              paddingLeft: '20px',
              paddingRight: '20px'
            }}
          >
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Row>
  );
});

export default ThongBaoList; 
