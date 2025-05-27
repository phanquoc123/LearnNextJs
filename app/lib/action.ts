"use server";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import postgres from "postgres";
import { z } from "zod";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: "Vui lòng chọn customer",
  }),
  amount: z.coerce.number().gt(0,{message : 'Vui lòng nhập số tiền lớn hơn 0'}),
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Vui lòng chọn trang thái hóa đơn",
  }),
  date: z.date(),
});

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
  formValues?: Record<string, any>;
};

const CreateInvoices = FormSchema.omit({ id: true, date: true });

export async function createInvoice(prevState: State, formData: FormData) {

  const formValues = {
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  }
  // console.log('formValues', formValues);
  
  // Validate form using Zod
  const validatedFields = CreateInvoices.safeParse(formValues);
 
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
      formValues,
    };
  }
 
  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];
 
  // Insert data into the database
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }
 
  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

const UpdateInvoices = FormSchema.omit({ id: true, date: true });



export async function updateInvoice(id: string, preState: State , formData: FormData) {
  const validatedFields = UpdateInvoices.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Invoice.",
      formValues: preState.formValues,
    };
  }
 const { customerId, amount, status } = validatedFields.data;
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

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}
