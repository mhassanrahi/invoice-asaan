"use server";

import { redirect } from "next/navigation";
import { db } from "../db";
import { Invoices, Customers, Status } from "../db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq, isNull } from "drizzle-orm";
import Stripe from "stripe";
import { headers } from "next/headers";
import { Resend } from "resend";
import InvoiceCreatedEmail from "@/components/emails/InvoiceCreated";
const stripe = new Stripe(String(process.env.NEXT_STRIPE_SECRET_KEY));
const resend = new Resend(String(process.env.RESEND_API_KEY));

export async function createInvoice(formData: FormData) {
  try {
    const { userId, orgId } = auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const value = Math.floor(parseFloat(String(formData.get("value"))) * 100);
    const description = String(formData.get("description"));
    const name = String(formData.get("name"));
    const email = String(formData.get("email"));

    const [customer] = await db
      .insert(Customers)
      .values({ name, email, organizationId: orgId || null })
      .returning({ id: Customers.id });

    const [invoice] = await db
      .insert(Invoices)
      .values({
        customerId: customer.id,
        value,
        description,
        createdBy: userId,
        organizationId: orgId || null,
      })
      .returning({
        id: Invoices.id,
      });

    const { error } = await resend.emails.send({
      from: "InvoiceAsaan <onboarding@resend.dev>",
      to: process.env.RECEIVER_EMAIL as string, // Just for testing, will be removed later
      subject: "You have a new invoice",
      react: InvoiceCreatedEmail({ invoiceId: invoice.id }),
    });

    if (error) {
      console.error("Error sending email, ", error);
    }

    return { success: true, invoiceId: invoice.id };
  } catch (error) {
    console.error("Error creating invoice, ", error);
    return { error: "Failed to create invoice" };
  }
}

export async function updateInvoiceStatus(formData: FormData) {
  try {
    const { userId, orgId } = auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    const invoiceId = String(formData.get("id"));
    const status = String(formData.get("status") as Status);

    if (orgId) {
      await db
        .update(Invoices)
        .set({ status })
        .where(
          and(
            eq(Invoices.id, Number(invoiceId)),
            eq(Invoices.organizationId, orgId)
          )
        );
    } else {
      await db
        .update(Invoices)
        .set({ status })
        .where(
          and(
            eq(Invoices.id, Number(invoiceId)),
            eq(Invoices.createdBy, userId),
            isNull(Invoices.organizationId)
          )
        );
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating invoice status, ", error);
    return { error: "Failed to update invoice status" };
  }
}

export async function deleteInvoice(formData: FormData) {
  try {
    const { userId, orgId } = auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }
    const invoiceId = String(formData.get("id"));
    if (orgId) {
      await db
        .delete(Invoices)
        .where(
          and(
            eq(Invoices.id, Number(invoiceId)),
            eq(Invoices.organizationId, orgId)
          )
        );
    } else {
      await db
        .delete(Invoices)
        .where(
          and(
            eq(Invoices.id, Number(invoiceId)),
            eq(Invoices.createdBy, userId),
            isNull(Invoices.organizationId)
          )
        );
    }
    return { success: true };
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return { error: "Failed to delete invoice" };
  }
}

export async function createPayment(formData: FormData) {
  const headersList = headers();
  const origin = headersList.get("origin");
  const id = Number.parseInt(formData.get("id") as string);

  const [result] = await db
    .select({
      status: Invoices.status,
      value: Invoices.value,
    })
    .from(Invoices)
    .where(eq(Invoices.id, id))
    .limit(1);

  if (!result) {
    throw new Error("Invoice not found");
  }

  if (result.value <= 0) {
    throw new Error("Invalid invoice amount");
  }

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Invoice #${id}`,
            description: "Invoice payment",
          },
          // product: process.env.NEXT_STRIPE_PRODUCT_ID,
          unit_amount: result.value,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${origin}/invoices/${id}/payment?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/invoices/${id}/payment?status=canceled&session_id={CHECKOUT_SESSION_ID}`,
    metadata: {
      invoiceId: id.toString(),
    },
  });

  if (!session.url) {
    throw new Error("Invalid Session");
  }

  redirect(session.url);
}
