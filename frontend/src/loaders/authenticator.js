import { redirect } from "react-router-dom";

export default async function authenticator() {
    const res = await fetch("/api/users/authenticate");
    if (!res.ok) {
        throw redirect("/login");   
    }
}