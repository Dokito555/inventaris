import { t } from "elysia";

export const registerRequest = t.Object({
  email: t.String({
    format: "email",
    error: "invalid error format",
  }),
  password: t.String({
    minLength: 8,
    error: "password must be a least 8 characters",
  }),
  name: t.String({
    minLength: 2,
    error: 'invalid name'
  }),
  // phone_number: t.Number({
  //   pattern: /^(\+62|62|0)8[1-9][0-9]{6,10}$/,
  // }),
  phone_number: t.String({})
});

export const loginRequest = t.Object({
  email: t.String({
    format: "email",
    error: "invalid error format",
  }),
  password: t.String({
    minLength: 8,
    error: "password must be a least 8 characters",
  }),
});

export const updateRequest = t.Object({
  name: t.Optional(t.String({
    minLength: 2,
    error: 'invalid name'
  })),
  email: t.Optional(t.String({
    format: "email",
    error: "invalid email format",
  })),
  password: t.Optional(t.String({
    minLength: 8,
    error: "password must be at least 8 characters",
  })),
});
