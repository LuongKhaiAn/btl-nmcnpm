const ADMIN_ACCOUNT = {
  username: "admin",
  password: "admin123",
  role: "admin",
};

export function login(username, password) {
  const isAdmin =
    username === ADMIN_ACCOUNT.username && password === ADMIN_ACCOUNT.password;

  if (!isAdmin) {
    return null;
  }

  const user = {
    username: ADMIN_ACCOUNT.username,
    role: ADMIN_ACCOUNT.role,
  };

  localStorage.setItem("currentUser", JSON.stringify(user));
  return user;
}

export function logout() {
  localStorage.removeItem("currentUser");
}

export function getCurrentUser() {
  const savedUser = localStorage.getItem("currentUser");

  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser);
  } catch {
    logout();
    return null;
  }
}

export function isAdmin() {
  return getCurrentUser()?.role === "admin";
}
