import { fetchCustomers } from "@/app/lib/data";
import Breadcrumbs from "../../../ui/invoices/breadcrumbs";
import Form from "../../../ui/invoices/create-form";
import { Metadata } from "next";
export const metadata:Metadata = {
  title: "Create Invoice",
  description: "Create a new invoice for your customers",
}
export default async function CreatePage() {
    const customers = await fetchCustomers();
    return (
        <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Create Invoice',
            href: '/dashboard/invoices/create',
            active: true,
          },
        ]}
      />
      <Form customers={customers} />
    </main>
    )
}