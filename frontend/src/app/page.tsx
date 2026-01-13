import { redirect } from "next/navigation";

export default function Page({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  // Preserve any query params (e.g. ?tableId=...) when redirecting to /guest
  redirect(`/tables`);
}
