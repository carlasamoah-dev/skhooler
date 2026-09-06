import { NextResponse } from "next/server";

const DEFAULT_MESSAGE = {
  400: "Please check the details above.",
  401: "That email and password do not match.",
  409: "That account already exists.",
  429: "Too many attempts, try again in a few minutes.",
};

/** One shape for every auth failure, so the forms can render them uniformly. */
export function errorResponse(result) {
  return NextResponse.json(
    {
      message: result.message ?? DEFAULT_MESSAGE[result.status] ?? "Something went wrong. Try again.",
      fieldErrors: result.fieldErrors ?? null,
    },
    { status: result.status },
  );
}
