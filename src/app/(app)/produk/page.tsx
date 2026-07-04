import { redirect } from "next/navigation";

// Backward compatibility: redirect old produk path to new inventory path
export default function ProdukRedirect() {
  redirect("/inventory");
}
