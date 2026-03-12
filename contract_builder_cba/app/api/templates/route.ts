import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const templates = await prisma.contractTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(templates);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const template = await prisma.contractTemplate.create({
      data: {
        name: body.name,
        description: body.description || "",
        category: body.category || "employment",
        canvasElements: body.canvasElements || null,
        defaultValues: body.defaultValues || null,
      },
    });
    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}
