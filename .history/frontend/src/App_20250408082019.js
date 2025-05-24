// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { useSelector } from 'react-redux';

// function App() {
//   const { isAuthenticated } = useSelector((state) => state.auth);

//   return (
//     <Router>
//       <ToastContainer />
//       <Routes>
//         <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
//         <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
//           {/* ... existing routes ... */}
//         </Route>
//       </Routes>
//     </Router>
//   );
// }

// export default App; 