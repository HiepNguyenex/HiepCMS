import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from 'bootstrap';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import orderService from '../../services/orderService';
import { toast } from '../../utils/toast';

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customer, setCustomer] = useState(null);

  // Modal detail states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    // Check if customer is logged in
    const storedCustomer = localStorage.getItem('customer');
    if (!storedCustomer) {
      setLoading(false);
      return;
    }

    const parsedCustomer = JSON.parse(storedCustomer);
    setCustomer(parsedCustomer);

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await orderService.getOrdersByCustomerId(parsedCustomer.id || parsedCustomer.Id);
        setOrders(data);
        setError(null);
      } catch (err) {
        console.error("Lỗi khi tải lịch sử đơn hàng:", err);
        setError("Không thể nạp danh sách đơn hàng của bạn.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatPrice = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const getStatusBadge = (status, notes) => {
    const isPaid = notes && notes.includes("Đã thanh toán");
    
    switch (status) {
      case 0:
        return (
          <span className="badge px-3 py-2 fw-semibold d-inline-flex align-items-center gap-1" style={{ borderRadius: '20px', fontSize: '0.7rem', color: '#856404', backgroundColor: '#fff3cd', border: '1px solid #ffeeba' }}>
            <i className="bi bi-hourglass-split"></i> {isPaid ? "ĐÃ THANH TOÁN (CHỜ DUYỆT)" : "CHỜ DUYỆT"}
          </span>
        );
      case 1:
        return (
          <span className="badge px-3 py-2 fw-semibold d-inline-flex align-items-center gap-1" style={{ borderRadius: '20px', fontSize: '0.7rem', color: '#0c5460', backgroundColor: '#d1ecf1', border: '1px solid #bee5eb' }}>
            <i className="bi bi-truck"></i> ĐANG GIAO
          </span>
        );
      case 2:
        return (
          <span className="badge px-3 py-2 fw-semibold d-inline-flex align-items-center gap-1" style={{ borderRadius: '20px', fontSize: '0.7rem', color: '#155724', backgroundColor: '#d4edda', border: '1px solid #c3e6cb' }}>
            <i className="bi bi-check-circle-fill"></i> ĐÃ GIAO
          </span>
        );
      case 3:
        return (
          <span className="badge px-3 py-2 fw-semibold d-inline-flex align-items-center gap-1" style={{ borderRadius: '20px', fontSize: '0.7rem', color: '#721c24', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb' }}>
            <i className="bi bi-x-circle-fill"></i> ĐÃ HỦY
          </span>
        );
      default:
        return (
          <span className="badge px-3 py-2 fw-semibold d-inline-flex align-items-center gap-1" style={{ borderRadius: '20px', fontSize: '0.7rem', color: '#383d41', backgroundColor: '#e2e3e5', border: '1px solid #d6d8db' }}>
            CHƯA RÕ
          </span>
        );
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      setDetailLoading(true);
      const detailData = await orderService.getOrderById(orderId);
      setSelectedOrder(detailData);
      
      // Kích hoạt Bootstrap Modal
      const modalElement = document.getElementById('orderDetailModal');
      if (modalElement) {
        const modal = Modal.getOrCreateInstance(modalElement);
        modal.show();
      }
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết đơn hàng:", err);
      toast.error("Không thể tải thông tin chi tiết đơn hàng này.");
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container py-5 text-center min-vh-100 d-flex flex-column justify-content-center align-items-center" style={{ backgroundColor: '#F8F7F4' }}>
          <div className="spinner-border text-warning mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
          <p className="text-muted-warm small">Đang tải lịch sử đơn hàng của bạn...</p>
        </div>
        <Footer />
      </>
    );
  }

  // Tính toán thống kê
  const totalOrders = orders.length;
  const totalSpent = orders
    .filter(o => o.status === 2 || o.notes?.includes("Đã thanh toán"))
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrdersCount = orders.filter(o => o.status === 0 || o.status === 1).length;

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#F8F7F4', fontFamily: '"Inter", sans-serif' }}>
      <Header />

      {/* Page Title & Breadcrumb */}
      <div className="bg-white py-4 shadow-sm border-bottom text-start">
        <div className="container px-4">
          <nav aria-label="breadcrumb" className="mb-2">
            <ol className="breadcrumb mb-0 text-uppercase small" style={{ letterSpacing: '1px' }}>
              <li className="breadcrumb-item"><a href="/" className="text-decoration-none text-charcoal">Trang chủ</a></li>
              <li className="breadcrumb-item active text-muted-warm" aria-current="page" style={{ fontWeight: '600' }}>Lịch sử đơn hàng</li>
            </ol>
          </nav>
          <h2 className="fw-bold font-serif mb-0 text-charcoal" style={{ letterSpacing: '0.5px' }}>ĐƠN HÀNG ĐÃ ĐẶT</h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="container flex-grow-1 py-5 px-4 text-start">
        {!customer ? (
          <div className="text-center py-5 bg-white shadow p-5 col-12 col-md-8 mx-auto" style={{ borderRadius: '20px', border: '1px solid #eaeaea' }}>
            <i className="bi bi-lock text-muted-warm d-block mb-3" style={{ fontSize: '4rem' }}></i>
            <h4 className="fw-bold font-serif text-charcoal mb-2">YÊU CẦU ĐĂNG NHẬP</h4>
            <p className="text-muted-warm small mb-4">Bạn cần đăng nhập tài khoản khách hàng để xem lịch sử mua sắm.</p>
            <div className="d-flex justify-content-center gap-3">
              <Link to="/login" className="btn btn-dark px-4 py-2.5 rounded-pill fw-bold" style={{ fontSize: '0.85rem' }}>
                ĐĂNG NHẬP
              </Link>
              <Link to="/register" className="btn btn-outline-dark px-4 py-2.5 rounded-pill fw-bold" style={{ fontSize: '0.85rem' }}>
                ĐĂNG KÝ
              </Link>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-warning text-center my-4 rounded-3" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i> {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-5 bg-white shadow p-5 col-12 col-md-8 mx-auto" style={{ borderRadius: '20px', border: '1px solid #eaeaea' }}>
            <i className="bi bi-receipt text-muted-warm d-block mb-3" style={{ fontSize: '4rem' }}></i>
            <h4 className="fw-bold font-serif text-charcoal mb-2">CHƯA CÓ ĐƠN HÀNG</h4>
            <p className="text-muted-warm small mb-4">Bạn chưa thực hiện giao dịch nào trên hệ thống HiepPerfume.</p>
            <Link to="/shop" className="btn btn-dark px-4 py-2.5 rounded-pill fw-bold" style={{ fontSize: '0.85rem', letterSpacing: '0.5px' }}>
              MUA SẮM NGAY
            </Link>
          </div>
        ) : (
          <>
            {/* THỐNG KÊ TỔNG QUAN */}
            <div className="row g-4 mb-4">
              <div className="col-md-4">
                <div className="card border-0 shadow-sm p-4 bg-white h-100" style={{ borderRadius: '16px', borderLeft: '5px solid #d4af37' }}>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <span className="text-muted-warm small text-uppercase fw-semibold" style={{ letterSpacing: '0.5px', fontSize: '0.75rem' }}>Tổng số đơn hàng</span>
                      <h3 className="fw-bold text-charcoal mb-0 mt-1">{totalOrders} đơn</h3>
                    </div>
                    <div className="p-3 bg-light rounded-circle text-charcoal d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                      <i className="bi bi-receipt fs-4"></i>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="card border-0 shadow-sm p-4 bg-white h-100" style={{ borderRadius: '16px', borderLeft: '5px solid #28a745' }}>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <span className="text-muted-warm small text-uppercase fw-semibold" style={{ letterSpacing: '0.5px', fontSize: '0.75rem' }}>Tổng tiền đã thanh toán</span>
                      <h3 className="fw-bold text-success mb-0 mt-1">{formatPrice(totalSpent)}</h3>
                    </div>
                    <div className="p-3 rounded-circle text-success d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px', backgroundColor: 'rgba(40, 167, 69, 0.1)' }}>
                      <i className="bi bi-wallet2 fs-4"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card border-0 shadow-sm p-4 bg-white h-100" style={{ borderRadius: '16px', borderLeft: '5px solid #ffc107' }}>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <span className="text-muted-warm small text-uppercase fw-semibold" style={{ letterSpacing: '0.5px', fontSize: '0.75rem' }}>Đơn hàng cần xử lý</span>
                      <h3 className="fw-bold text-warning mb-0 mt-1">{pendingOrdersCount} đơn</h3>
                    </div>
                    <div className="p-3 rounded-circle text-warning d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px', backgroundColor: 'rgba(255, 193, 7, 0.1)' }}>
                      <i className="bi bi-hourglass-split fs-4"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* DANH SÁCH BẢNG ĐƠN HÀNG CẢI TIẾN */}
            <div className="card border-0 shadow bg-white" style={{ borderRadius: '20px', overflow: 'hidden' }}>
              <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
                <h5 className="fw-bold font-serif mb-0 text-charcoal d-flex align-items-center gap-2">
                  <i className="bi bi-list-task text-warning"></i> LỊCH SỬ GIAO DỊCH
                </h5>
                <span className="badge bg-light text-charcoal border text-uppercase small px-3 py-1.5" style={{ fontSize: '0.7rem' }}>
                  Khách hàng: {customer.fullName || customer.FullName}
                </span>
              </div>

              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table align-middle table-hover mb-0">
                    <thead className="table-light">
                      <tr className="text-uppercase small fw-bold text-secondary" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                        <th scope="col" className="ps-4" style={{ width: '10%' }}>Mã đơn</th>
                        <th scope="col" style={{ width: '20%' }}>Ngày đặt</th>
                        <th scope="col" style={{ width: '30%' }}>Ghi chú / Địa chỉ</th>
                        <th scope="col" style={{ width: '15%' }}>Tổng tiền</th>
                        <th scope="col" style={{ width: '15%' }}>Trạng thái</th>
                        <th scope="col" className="pe-4 text-end" style={{ width: '10%' }}>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((ord) => (
                        <tr key={ord.id} className="border-bottom border-light" style={{ transition: 'all 0.2s ease' }}>
                          <td className="ps-4">
                            <span className="fw-bold text-charcoal">#{ord.id}</span>
                          </td>
                          <td>
                            <div className="d-flex flex-column">
                              <span className="text-charcoal small fw-semibold">
                                {ord.orderDate ? new Date(ord.orderDate).toLocaleDateString('vi-VN') : '---'}
                              </span>
                              <span className="text-muted-warm" style={{ fontSize: '0.75rem' }}>
                                {ord.orderDate ? new Date(ord.orderDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '---'}
                              </span>
                            </div>
                          </td>
                          <td>
                            <p className="mb-0 text-truncate text-muted-warm small" style={{ maxWidth: '300px' }} title={ord.notes}>
                              {ord.notes || 'Không có ghi chú'}
                            </p>
                          </td>
                          <td>
                            <span className="fw-bold text-charcoal" style={{ fontSize: '0.95rem' }}>
                              {formatPrice(ord.totalAmount)}
                            </span>
                          </td>
                          <td>
                            {getStatusBadge(ord.status, ord.notes)}
                          </td>
                          <td className="pe-4 text-end">
                            <button
                              onClick={() => handleViewDetails(ord.id)}
                              className="btn btn-sm btn-outline-dark rounded-pill px-3 py-1.5 d-inline-flex align-items-center gap-1"
                              style={{ fontSize: '0.72rem', fontWeight: '600', transition: 'all 0.2s ease' }}
                              disabled={detailLoading}
                            >
                              <i className="bi bi-eye"></i> CHI TIẾT
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bootstrap Modal for Order Details */}
      <div className="modal fade" id="orderDetailModal" tabIndex="-1" aria-labelledby="orderDetailModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px', overflow: 'hidden' }}>
            <div className="modal-header bg-dark text-white py-3 border-0">
              <h5 className="modal-title font-serif fw-bold d-flex align-items-center gap-2" id="orderDetailModalLabel" style={{ letterSpacing: '0.5px' }}>
                <i className="bi bi-file-earmark-text text-warning"></i> CHI TIẾT ĐƠN HÀNG {selectedOrder && `#${selectedOrder.id}`}
              </h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            
            <div className="modal-body p-4 text-start" style={{ backgroundColor: '#FCFCFA' }}>
              {selectedOrder && (
                <>
                  {/* Delivery info card */}
                  <div className="card border-0 shadow-sm p-4 mb-4 bg-white" style={{ borderRadius: '12px' }}>
                    <div className="row g-4 small">
                      <div className="col-md-6 border-end-md">
                        <h6 className="fw-bold font-serif text-warning mb-3 text-uppercase" style={{ letterSpacing: '0.5px', fontSize: '0.8rem' }}>
                          <i className="bi bi-person-fill"></i> Thông tin khách nhận
                        </h6>
                        <p className="mb-2"><strong>Họ và tên:</strong> {selectedOrder.customerName}</p>
                        <p className="mb-2"><strong>Điện thoại:</strong> {selectedOrder.customerPhone || '---'}</p>
                        <p className="mb-0"><strong>Email:</strong> {selectedOrder.customerEmail || '---'}</p>
                      </div>
                      <div className="col-md-6">
                        <h6 className="fw-bold font-serif text-warning mb-3 text-uppercase" style={{ letterSpacing: '0.5px', fontSize: '0.8rem' }}>
                          <i className="bi bi-geo-alt-fill"></i> Thông tin vận chuyển
                        </h6>
                        <p className="mb-2"><strong>Địa chỉ nhận:</strong> {selectedOrder.customerAddress || '---'}</p>
                        <p className="mb-2"><strong>Ngày đặt hàng:</strong> {new Date(selectedOrder.orderDate).toLocaleString('vi-VN')}</p>
                        <p className="mb-0"><strong>Ghi chú:</strong> {selectedOrder.notes || '---'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: '12px' }}>
                    <h6 className="fw-bold font-serif text-charcoal mb-3 text-uppercase" style={{ letterSpacing: '0.5px', fontSize: '0.8rem' }}>
                      <i className="bi bi-cart-fill text-warning me-1"></i> Danh sách sản phẩm đặt
                    </h6>
                    <div className="table-responsive">
                      <table className="table align-middle table-hover mb-0">
                        <thead>
                          <tr className="text-uppercase text-secondary small fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                            <th scope="col">Tên nước hoa</th>
                            <th scope="col" className="text-center" style={{ width: '15%' }}>Số lượng</th>
                            <th scope="col" className="text-end" style={{ width: '25%' }}>Đơn giá</th>
                            <th scope="col" className="text-end" style={{ width: '25%' }}>Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.details && selectedOrder.details.map((detail) => (
                            <tr key={detail.id} className="border-bottom border-light">
                              <td className="py-3">
                                <span className="fw-bold text-charcoal" style={{ fontSize: '0.85rem' }}>{detail.productName || 'Nước hoa'}</span>
                              </td>
                              <td className="text-center py-3">
                                <span className="text-charcoal fw-bold">{detail.quantity}</span>
                              </td>
                              <td className="text-end py-3">
                                <span className="text-muted-warm small">{formatPrice(detail.unitPrice)}</span>
                              </td>
                              <td className="text-end py-3">
                                <span className="fw-bold text-charcoal">{formatPrice(detail.totalPrice)}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan="3" className="text-end fw-bold py-3 border-0 text-charcoal">Tổng tiền đơn hàng:</td>
                            <td className="text-end fw-bold py-3 border-0 text-danger fs-5">
                              {formatPrice(selectedOrder.details ? selectedOrder.details.reduce((sum, d) => sum + d.totalPrice, 0) : 0)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="modal-footer border-0 py-3 bg-light d-flex justify-content-end px-4">
              <button
                type="button"
                className="btn btn-dark px-4 py-2 rounded-pill fw-bold text-uppercase"
                data-bs-dismiss="modal"
                style={{ borderRadius: '20px', fontSize: '0.75rem', letterSpacing: '0.5px' }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default OrderHistory;
