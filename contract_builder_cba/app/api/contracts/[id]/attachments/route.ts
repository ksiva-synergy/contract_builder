import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { saveFile } from "@/lib/file-storage";

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

    const attachments = await prisma.documentAttachment.findMany({
      where: { contractId: id },
      include: {
        uploadedBy: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(attachments);
  } catch (error) {
    console.error("Error listing attachments:", error);
    return NextResponse.json(
      { error: "Failed to list attachments" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { filePath, fileName, fileSize } = await saveFile(
      buffer,
      file.name,
      `attachments/${id}`
    );

    const attachment = await prisma.documentAttachment.create({
      data: {
        contractId: id,
        fileName,
        filePath,
        fileSize,
        mimeType: file.type || "application/octet-stream",
        uploadedById: (session.user as { id: string }).id,
      },
      include: {
        uploadedBy: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error("Error uploading attachment:", error);
    return NextResponse.json(
      { error: "Failed to upload attachment" },
      { status: 500 }
    );
  }
}
