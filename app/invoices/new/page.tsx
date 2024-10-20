"use client";
import { SyntheticEvent, useState } from "react";
import Form from "next/form";
import { useRouter } from "next/navigation";

import Container from "../../../components/Container";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";

import { createInvoice } from "../../actions";
import SubmitButton from "../../../components/SubmitButton";

export default function Home() {
  const [state, setState] = useState("ready");
  const [error, setError] = useState<string>();
  const router = useRouter();

  async function handleOnSubmit(event: SyntheticEvent) {
    if (state === "pending") {
      event.preventDefault();
      return;
    }
    setState("pending");
  }

  async function handleOnCreateInvoice(formData: FormData) {
    try {
      const result = await createInvoice(formData);
      if (result.error) {
        setError(result.error);
        setState("ready");
        return;
      }
      router.push(`/invoices/${result.invoiceId}`);
    } catch (error) {
      console.error("Error creating invoice, ", error);
    }
  }

  return (
    <main className="h-full">
      <Container>
        {error && (
          <p className="bg-red-100 text-sm text-red-800 text-center px-3 py-2 rounded-lg mb-6">
            {error}
          </p>
        )}
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-semibold">Create Invoice</h1>
        </div>

        <Form
          action={handleOnCreateInvoice}
          onSubmit={handleOnSubmit}
          className="grid gap-4 max-w-xs"
        >
          <div>
            <Label htmlFor="name" className="block font-semibold text-sm mb-2">
              Billing Name
            </Label>
            <Input id="name" name="name" type="text" />
          </div>
          <div>
            <Label htmlFor="email" className="block font-semibold text-sm mb-2">
              Billing Email
            </Label>
            <Input id="email" name="email" type="email" />
          </div>
          <div>
            <Label htmlFor="value" className="block font-semibold text-sm mb-2">
              Value
            </Label>
            <Input id="value" name="value" type="text" />
          </div>
          <div>
            <Label
              htmlFor="description"
              className="block font-semibold text-sm mb-2"
            >
              Description
            </Label>
            <Textarea id="description" name="description" />
          </div>
          <SubmitButton />
        </Form>
      </Container>
    </main>
  );
}
