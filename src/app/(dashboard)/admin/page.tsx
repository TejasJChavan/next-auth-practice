import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import React from "react";

async function Admin() {
    const session = await getServerSession(authOptions);

    if (session?.user) {
        return <h2>Welcome to admin, {session?.user.username}</h2>;
    }

    return <h2>Please login to view this page.</h2>;
}

export default Admin;
