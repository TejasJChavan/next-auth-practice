import Link from "next/link";

export default function Home() {
    return (
        <>
            <div>
                <h1 className="text-4xl">Home</h1>
                <Link href="/admin">Open Admin Dashboard.</Link>
            </div>
        </>
    );
}
