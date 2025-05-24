export default function authHeader() {
  const user = JSON.parse(localStorage.getItem('user'));

  if (user && user.token) {
    // console.log("Adding token to header:", user.token);
    // Đối với Spring Boot backend + Token-based Auth:
    return { Authorization: 'Bearer ' + user.token };
  } else {
    return {};
  }
} 