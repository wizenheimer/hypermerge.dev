import { redirect } from "next/navigation";

export default function Home() {
  //add redirect via middleware
  
  redirect("/insights");
}
