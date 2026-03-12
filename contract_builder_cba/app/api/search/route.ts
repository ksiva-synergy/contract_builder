import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type") || "vessels";

  try {
    if (type === "vessels") {
      const vessels = await prisma.vessels.findMany({
        where: q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { imo_number: { contains: q, mode: "insensitive" } },
              ],
            }
          : undefined,
        take: 20,
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          imo_number: true,
          flag: true,
          vessel_type: true,
        },
      });
      return NextResponse.json(vessels);
    }

    if (type === "seafarers") {
      const seafarers = await prisma.seafarers.findMany({
        where: q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { crew_code: { contains: q, mode: "insensitive" } },
              ],
            }
          : undefined,
        take: 20,
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          rank: true,
          nationality: true,
          crew_code: true,
          vessel_id: true,
        },
      });
      return NextResponse.json(seafarers);
    }

    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}
