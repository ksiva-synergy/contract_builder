import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const clauses = await prisma.clause.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { title: "asc" }],
    });
    return NextResponse.json(clauses);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch clauses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const clause = await prisma.clause.create({
      data: {
        title: body.title,
        content: body.content,
        category: body.category,
        version: body.version || 1,
      },
    });
    return NextResponse.json(clause, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create clause" }, { status: 500 });
  }
}
