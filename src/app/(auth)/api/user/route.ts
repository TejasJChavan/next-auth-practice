import { prisma } from "@/lib/db";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";
import { z } from "zod";

const userSchema = z.object({
    username: z.string().min(1, "Username is required").max(100),
    email: z.string().min(1, "Email is required").email("Invalid email"),
    password: z
        .string()
        .min(1, "Password is required")
        .min(8, "Password must have than 8 characters"),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { username, email, password } = userSchema.parse(body);

        //check user by email
        const existingUserByEmail = await prisma.user.findUnique({
            where: {
                email,
            },
        });
        if (existingUserByEmail) {
            return NextResponse.json(
                {
                    user: null,
                    message: "User with this email already exists.",
                },
                { status: 409 }
            );
        }

        //check user by username
        const existingUserByUsername = await prisma.user.findUnique({
            where: {
                username,
            },
        });
        if (existingUserByUsername) {
            return NextResponse.json(
                {
                    user: null,
                    message: "User with this username already exists.",
                },
                { status: 409 }
            );
        }

        const hashedPassword = await hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });

        const { password: newUserPassword, ...rest } = newUser;

        return NextResponse.json(
            {
                user: rest,
                message: "User created successfully",
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        return NextResponse.json(
            {
                message: "Something went wrong!",
            },
            { status: 500 }
        );
    }
}
