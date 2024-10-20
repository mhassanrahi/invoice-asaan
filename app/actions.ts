"use server";

import { db } from "../db";
import { Invoices, Customers, Status } from "../db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq, isNull } from "drizzle-orm";

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
