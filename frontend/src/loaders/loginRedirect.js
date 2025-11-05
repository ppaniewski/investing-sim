import { redirect } from "react-router-dom";

export default async function loginRedirect() {
    const res = await fetch("/api/users/authenticate");

    // If the response gives a successful status, the user is
    // logged in and should be redirected to the portfolio page
    if (res.ok) {
        throw redirect("/portfolio");
    }
}