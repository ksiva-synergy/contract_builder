import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    const workflows = await prisma.workflowTemplate.findMany({
      where: { createdById: userId, isActive: true },
      include: {
        createdBy: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(workflows);
  } catch (error) {
    console.error("Error fetching workflows:", error);
    return NextResponse.json(
      { error: "Failed to fetch workflows" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await request.json();
    const { name, description, steps } = body;

    if (!name || !steps) {
      return NextResponse.json(
        { error: "Name and steps are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(steps) || steps.length === 0) {
      return NextResponse.json(
        { error: "Steps must be a non-empty array" },
        { status: 400 }
      );
    }

    for (const step of steps) {
      if (!step.order || !step.role || !step.label) {
        return NextResponse.json(
          {
            error:
              "Each step must have order, role, and label fields",
          },
          { status: 400 }
        );
      }
    }

    const workflow = await prisma.workflowTemplate.create({
      data: {
        name,
        description: description || null,
        steps,
        createdById: userId,
      },
      include: {
        createdBy: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json(workflow, { status: 201 });
  } catch (error) {
    console.error("Error creating workflow:", error);
    return NextResponse.json(
      { error: "Failed to create workflow" },
      { status: 500 }
    );
  }
}
