import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const workflow = await prisma.workflowTemplate.findUnique({
      where: { id },
      include: {
        createdBy: { select: { name: true, email: true } },
      },
    });

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(workflow);
  } catch (error) {
    console.error("Error fetching workflow:", error);
    return NextResponse.json(
      { error: "Failed to fetch workflow" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const user = session.user as { id: string; role: string };

    const existing = await prisma.workflowTemplate.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    if (existing.createdById !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, steps, isActive } = body;

    const workflow = await prisma.workflowTemplate.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(steps !== undefined && { steps }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        createdBy: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json(workflow);
  } catch (error) {
    console.error("Error updating workflow:", error);
    return NextResponse.json(
      { error: "Failed to update workflow" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const user = session.user as { id: string; role: string };

    const existing = await prisma.workflowTemplate.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    if (existing.createdById !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.workflowTemplate.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Workflow deleted successfully" });
  } catch (error) {
    console.error("Error deleting workflow:", error);
    return NextResponse.json(
      { error: "Failed to delete workflow" },
      { status: 500 }
    );
  }
}
