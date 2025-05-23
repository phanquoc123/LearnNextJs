"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import postgres from "postgres";
import { z } from "zod";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(["pending", "paid"]),
  date: z.date(),
});

const CreateInvoices = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoices.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  console.log(customerId);
  console.log(amount);
  console.log(status);
  const amountIncents = amount * 100;
  // nhân thêm 100 để tránh lỗi JavaScript floating-point  và để đảm bảo độ chính xác hơn
  const date = new Date().toISOString().split("T")[0];

  /// Insert database
  try {
    await sql`
    INSERT INTO invoices (customer_id, amount, status , date)
    VALUES (${customerId},${amountIncents},${status},${date})
    `;
  } catch (error) {
    console.error("Có lỗi xảy ra khi thêm", error);
  }
  revalidatePath("/dashboard/invoices"); /// clear form
  redirect("/dashboard/invoices");
}

const UpdateInvoices = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoices.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  const amountIncents = amount * 100;
  try {
    await sql`
    UPDATE invoices SET customer_id = ${customerId}, amount = ${amountIncents},status = ${status} WHERE id = ${id}
    `;
  } catch (error) {
    console.error("Có lỗi xảy ra khi thêm", error);
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath("/dashboard/invoices");
}
