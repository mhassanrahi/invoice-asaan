"use client";

import NextError from "next/error";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return <NextError title={error.message} reset={reset} statusCode={500} />;
}
