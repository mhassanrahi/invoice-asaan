"use client";
import { useRouter } from "next/navigation";
import Container from "../../../components/Container";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../lib/utils";
import { Invoices } from "../../../db/schema";
import { Button } from "../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { ChevronDown, Ellipsis, Trash2 } from "lucide-react";
import { useOptimistic } from "react";
import { AVAILABLE_STATUSES } from "../../../constants";
import { updateInvoiceStatus, deleteInvoice } from "../../actions";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface InvoiceProps {
  invoice: typeof Invoices.$inferSelect & {
    customerId: number;
    name: string;
    email: string;
  };
}

const Invoice = ({ invoice }: InvoiceProps) => {
  const [currentStatus, setCurrentStatus] = useOptimistic(
    invoice.status,
    (_state, newStatus) => String(newStatus)
  );
  const router = useRouter();

  async function handleOnUpdateStatus(formData: FormData) {
    const originalStatus = currentStatus;
    setCurrentStatus(formData.get("status"));
    try {
      const result = await updateInvoiceStatus(formData);
      if (result.error) {
        setCurrentStatus(originalStatus);
        return;
      }
      router.refresh();
    } catch {
      setCurrentStatus(originalStatus);
    }
  }

  async function handleOnDeleteInvoice(formData: FormData) {
    try {
      const result = await deleteInvoice(formData);

      if (result.error) {
        console.error(result.error);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Delete invoice error:", err);
    }
  }

  return (
    <main className="w-full h-full">
      <Container>
        <div className="flex justify-between mb-8">
          <h1 className="flex items-center gap-4 text-3xl font-semibold">
            Invoice {invoice.id}
            <Badge
              className={cn(
                "rounded-full capitalize",
                currentStatus === "pending" && "bg-blue-500",
                currentStatus === "paid" && "bg-green-600"
              )}
            >
              {currentStatus}
            </Badge>
          </h1>
          <div className="flex gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="flex items-center gap-2"
                  variant="outline"
                  type="button"
                >
                  Change Status
                  <ChevronDown className="w-4 h-auto" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {AVAILABLE_STATUSES.map((status) => (
                  <DropdownMenuItem key={status.id}>
                    <form action={handleOnUpdateStatus}>
                      <input type="hidden" name="id" value={invoice.id} />
                      <input type="hidden" name="status" value={status.id} />
                      <button type="submit">{status.label}</button>
                    </form>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="flex items-center gap-2"
                  variant="outline"
                  type="button"
                >
                  <span className="sr-only">More Options</span>
                  <Ellipsis className="w-4 h-auto" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <form action={deleteInvoice}>
                    <input type="hidden" name="id" value={invoice.id} />
                    <button className="flex items-center gap-2" type="submit">
                      <Trash2 className="w-4 h-auto" />
                      Delete Invoice
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}

            <Dialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="flex items-center gap-2"
                    variant="outline"
                    type="button"
                  >
                    <span className="sr-only">More Options</span>
                    <Ellipsis className="w-4 h-auto" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <DialogTrigger asChild>
                      <button className="flex items-center gap-2" type="submit">
                        <Trash2 className="w-4 h-auto" />
                        Delete Invoice
                      </button>
                    </DialogTrigger>
                  </DropdownMenuItem>

                  {/* <DropdownMenuItem>
                    <Link
                      href={`/invoices/${invoice.id}/payment`}
                      className="flex items-center gap-2"
                    >
                      <CreditCard className="w-4 h-auto" />
                      Payment
                    </Link>
                  </DropdownMenuItem> */}
                </DropdownMenuContent>
              </DropdownMenu>

              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    Delete Invoice?
                  </DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete
                    your invoice and remove your data from our servers.
                  </DialogDescription>
                  <DialogFooter>
                    <form
                      className="flex justify-center"
                      action={handleOnDeleteInvoice}
                    >
                      <input type="hidden" name="id" value={invoice.id} />
                      <Button
                        variant="destructive"
                        className="flex items-center gap-2"
                        type="submit"
                      >
                        <Trash2 className="w-4 h-auto" />
                        Delete Invoice
                      </Button>
                    </form>
                  </DialogFooter>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <p className="text-3xl mb-3">${(invoice.value / 100).toFixed(2)}</p>

        <p className="text-lg mb-8">{invoice.description}</p>

        <h2 className="font-bold text-lg mb-4">Billing Details</h2>

        <ul className="grid gap-2">
          <li className="flex gap-4">
            <strong className="block w-28 flex-shrink-0 font-medium text-sm">
              Invoice ID
            </strong>
            <span>{invoice.id}</span>
          </li>
          <li className="flex gap-4">
            <strong className="block w-28 flex-shrink-0 font-medium text-sm">
              Invoice Date
            </strong>
            <span>{new Date(invoice.createdAt).toLocaleDateString()}</span>
          </li>
          <li className="flex gap-4">
            <strong className="block w-28 flex-shrink-0 font-medium text-sm">
              Billing Name
            </strong>
            <span>{invoice.name}</span>
          </li>
          <li className="flex gap-4">
            <strong className="block w-28 flex-shrink-0 font-medium text-sm">
              Billing Email
            </strong>
            <span>{invoice.email}</span>
          </li>
        </ul>
      </Container>
    </main>
  );
};

export default Invoice;
