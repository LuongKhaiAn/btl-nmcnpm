const ADMIN_ACCOUNT = {
  username: "admin",
  password: "admin123",
  role: "admin",
};

const CUSTOMER_ACCOUNT = {
  username: "customer",
  password: "123456",
  role: "customer",
  customerId: 1,
};

export function login(username, password) {
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

  const isCustomer =
    username === CUSTOMER_ACCOUNT.username && password === CUSTOMER_ACCOUNT.password;

  if (!isCustomer) {
    return null;
  }

  const user = {
    username: CUSTOMER_ACCOUNT.username,
    role: CUSTOMER_ACCOUNT.role,
    customerId: CUSTOMER_ACCOUNT.customerId,
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

export function isCustomer() {
  return getCurrentUser()?.role === "customer";
}
