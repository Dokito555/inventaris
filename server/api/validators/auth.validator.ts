import { t } from "elysia";

export const registerRequest = t.Object({
  email: t.String({
    format: "email",
    error: "Format email tidak valid" // ✅ Ubah pesan error
  }),
  password: t.String({
    minLength: 8,
    error: "Password minimal 8 karakter" // ✅ Ubah pesan error
  }),
  name: t.String({
    minLength: 2,
    error: "Nama minimal 2 karakter" // ✅ Ubah pesan error
  }),
  phone_number: t.String({
    minLength: 10,
    maxLength: 15,
    error: "Nomor telepon tidak valid" // ✅ Tambah validasi
  }),
  teleId: t.Optional(t.String())
});

export const loginRequest = t.Object({
  email: t.String({
    format: "email",
    error: "Format email tidak valid"
  }),
  password: t.String({
    minLength: 8,
    error: "Password minimal 8 karakter"
  }),
});

export const updateRequest = t.Object({
  name: t.Optional(t.String({
    minLength: 2,
    error: "Nama minimal 2 karakter"
  })),
  email: t.Optional(t.String({
    format: "email",
    error: "Format email tidak valid"
  })),
  password: t.Optional(t.String({
    minLength: 8,
    error: "Password minimal 8 karakter"
  })),
  image: t.Optional(t.String())
});