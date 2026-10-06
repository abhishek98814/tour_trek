import Link from "next/link";

export default function TourCard({ tour }: any) {
  const image =
    tour.cover_image ||
    tour.images?.[0]?.image ||
    "/placeholder.jpg";

  return (
    <Link href={`/tours/${tour.slug}`} style={{ textDecoration: "none" }}>
      <div style={{
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #e5e7eb",
        background: "#fff",
        cursor: "pointer",
      }}>

    
        <div
          style={{
            height: "200px",
            backgroundImage: `url(${`${process.env.NEXT_PUBLIC_MEDIA_URL}${tour.cover_image}`})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* <img 
       src={`${process.env.NEXT_PUBLIC_MEDIA_URL}${tour.cover_image}`} 
       alt={tour.title} /> */}

     
        <div style={{ padding: "14px" }}>
          <h3 style={{ fontSize: "16px", color:"#1d1b1b", fontWeight: 600 }}>
            {tour.title}
          </h3>

          <p style={{ fontSize: "13px", color: "#666" }}>
             {tour.destination}
          </p>

          <p style={{ fontWeight: 700, color:"#191818", marginTop: "8px" }}>
            NPrs: {tour.price_per_person}
          </p>
        </div>
      </div>
    </Link>
  );
}