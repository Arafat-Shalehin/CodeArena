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
  try {
    const { email, password } = await req.json();
    const user = await loginUser(email, password);

    return Response.json({ success: true, data: user });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 401 },
    );
  }
}

export async function fetchUsers() {
  try {
    const users = await getAllUsers();
    return Response.json({ success: true, data: users });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function fetchUserById(req, { params }) {
  try {
    const user = await getUserById(params.id);
    return Response.json({ success: true, data: user });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 404 },
    );
  }
}

export async function removeUser(req, { params }) {
  try {
    await deleteUser(params.id);
    return Response.json({ success: true, message: "User deleted." });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 400 },
    );
  }
}
