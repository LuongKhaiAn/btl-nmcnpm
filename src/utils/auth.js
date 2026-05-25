const ADMIN_ACCOUNT = {
  username: "admin",
  password: "admin123",
  role: "admin",
};

export async function login(username, password) {
  const isAdmin =
    username === ADMIN_ACCOUNT.username && password === ADMIN_ACCOUNT.password;

  if (isAdmin) {
    const user = {
      username: ADMIN_ACCOUNT.username,
      role: ADMIN_ACCOUNT.role,
    };

    localStorage.setItem("currentUser", JSON.stringify(user));
    return user;
  }

  try {
    const response = await fetch("/api/auth/customer-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const user = await response.json();

    if (!response.ok) {
      return null;
    }

    localStorage.setItem("currentUser", JSON.stringify(user));
    return user;
  } catch {
    return null;
  }
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

export function isCustomer() {
  return getCurrentUser()?.role === "customer";
}
