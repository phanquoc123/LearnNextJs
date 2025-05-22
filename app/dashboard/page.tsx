import Image from "next/image";

export default function Dashboard () {
    return (
        <>
        <h1>Trang Dashboard</h1>
        <Image
        alt="Picture of the author" 
        width={600}
        height={400}
        src="https://placehold.co/600x400"
        />
        </>
    )
}