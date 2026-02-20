import {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  deleteUser,
} from "@/services/user.service";

export async function createUser(req) {
  const body = await req.json();
  const user = await registerUser(body);

  return Response.json({ success: true, data: user }, { status: 201 });
}

export async function login(req) {
  const { email, password } = await req.json();
  const user = await loginUser(email, password);

  return Response.json({ success: true, data: user });
}

export async function fetchUsers() {
  const users = await getAllUsers();
  return Response.json({ success: true, data: users });
}

export async function fetchUserById(req, { params }) {
  const user = await getUserById(params.id);
  return Response.json({ success: true, data: user });
}

export async function removeUser(req, { params }) {
  await deleteUser(params.id);
  return Response.json({ success: true, message: "User deleted." });
}
