import { db } from "../../../db";
import { Invoices, Customers } from "../../../db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Invoice from "./Invoice";

const InvoicePage = async ({ params }: { params: { invoiceId: string } }) => {
  const { userId, orgId } = auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  const { invoiceId } = await params;
  const invoiceIdNumber = parseInt(invoiceId);

  if (isNaN(invoiceIdNumber)) {
    return "Invalid invoice ID";
  }

  let invoice;
  let invoiceFetched;

  try {
    if (orgId) {
      [invoiceFetched] = await db
        .select({
          customerId: Customers.id,
          name: Customers.name,
          email: Customers.email,
          ...Invoices,
        })
        .from(Invoices)
        .innerJoin(Customers, eq(Invoices.customerId, Customers.id))
        .where(
          and(
            eq(Invoices.id, invoiceIdNumber),
            eq(Invoices.organizationId, orgId)
          )
        )
        .limit(1);
    } else {
      [invoiceFetched] = await db
        .select({
          customerId: Customers.id,
          name: Customers.name,
          email: Customers.email,
          ...Invoices,
        })
        .from(Invoices)
        .innerJoin(Customers, eq(Invoices.customerId, Customers.id))
        .where(
          and(
            eq(Invoices.id, invoiceIdNumber),
            eq(Invoices.createdBy, userId),
            isNull(Invoices.organizationId)
          )
        )
        .limit(1);
    }

    if (!invoiceFetched) {
      notFound();
    }
    invoice = invoiceFetched;
  } catch (error) {
    console.log(error.message);
    return notFound();
  }

  return <Invoice invoice={invoice} />;
};

export default InvoicePage;
