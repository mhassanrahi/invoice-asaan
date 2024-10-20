import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { db } from "../../db";
import { Invoices, Customers } from "../../db/schema";
import { cn } from "../../lib/utils";
import { CirclePlus } from "lucide-react";
import Link from "next/link";
import Container from "../../components/Container";
import { auth } from "@clerk/nextjs/server";
import { eq, and, isNull } from "drizzle-orm";

export default async function Dashboard() {
  const { userId, orgId } = auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  let invoices = [];

  try {
    if (orgId) {
      invoices = await db
        .select({
          customerId: Customers.id,
          name: Customers.name,
          email: Customers.email,
          ...Invoices,
        })
        .from(Invoices)
        .innerJoin(Customers, eq(Invoices.customerId, Customers.id))
        .where(eq(Invoices.organizationId, orgId));
    } else {
      invoices = await db
        .select({
          customerId: Customers.id,
          name: Customers.name,
          email: Customers.email,
          ...Invoices,
        })
        .from(Invoices)
        .innerJoin(Customers, eq(Invoices.customerId, Customers.id))
        .where(
          and(eq(Invoices.createdBy, userId), isNull(Invoices.organizationId))
        );
    }
  } catch (error) {
    console.error(error.message);
  }

  return (
    <main className="h-full">
      <Container>
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p>
            <Button className="inline-flex gap-2" variant="ghost" asChild>
              <Link href="/invoices/new">
                <CirclePlus className="h-4 w-4" />
                <span className="font-semibold">Create Invoice</span>
              </Link>
            </Button>
          </p>
        </div>

        <Table>
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] p-4">Date</TableHead>
              <TableHead className="p-4">Customer</TableHead>
              <TableHead className="p-4">Email</TableHead>
              <TableHead className="text-center p-4">Status</TableHead>
              <TableHead className="text-right p-4">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium text-left p-0">
                  <Link
                    href={`/invoices/${invoice.id}`}
                    className="block p-4 font-semibold"
                  >
                    {new Date(invoice.createdAt).toLocaleDateString()}
                  </Link>
                </TableCell>
                <TableCell className="text-left p-0">
                  <Link
                    href={`/invoices/${invoice.id}`}
                    className="block p-4 font-semibold"
                  >
                    {invoice.name}
                  </Link>
                </TableCell>
                <TableCell className="text-left p-0">
                  <Link href={`/invoices/${invoice.id}`} className="block p-4">
                    {invoice.email}
                  </Link>
                </TableCell>
                <TableCell className="text-center p-0">
                  <Link className="block p-4" href={`/invoices/${invoice.id}`}>
                    <Badge
                      className={cn(
                        "rounded-full capitalize",
                        invoice.status === "pending" && "bg-blue-500",
                        invoice.status === "paid" && "bg-green-600"
                      )}
                    >
                      {invoice.status}
                    </Badge>
                  </Link>
                </TableCell>
                <TableCell className="text-right p-0">
                  <Link
                    href={`/invoices/${invoice.id}`}
                    className="block p-4 font-semibold"
                  >
                    ${(invoice.value / 100).toFixed(2)}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Container>
    </main>
  );
}
