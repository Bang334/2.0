export default function authHeader() {
  const user = JSON.parse(localStorage.getItem('user'));

  if (user && user.token) {
    console.log("Token in authHeader:", user.token.substring(0, 20) + "...");
    console.log("User object structure:", Object.keys(user));
    
    // Đối với Spring Boot backend + Token-based Auth:
    return { Authorization: 'Bearer ' + user.token };
  } else {
    console.log("No token found in localStorage!");
    return {};
  }
} 