import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getFile, deleteFile } from "@/lib/file-storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; attachmentId: string }> }
) {
  try {
    const { id, attachmentId } = await params;

    const attachment = await prisma.documentAttachment.findFirst({
      where: { id: attachmentId, contractId: id },
    });

    if (!attachment) {
      return NextResponse.json(
        { error: "Attachment not found" },
        { status: 404 }
      );
    }

    const fileBuffer = await getFile(attachment.filePath);

    return new Response(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": attachment.mimeType,
        "Content-Disposition": `attachment; filename="${attachment.fileName}"`,
        "Content-Length": String(attachment.fileSize),
      },
    });
  } catch (error) {
    console.error("Error downloading attachment:", error);
    return NextResponse.json(
      { error: "Failed to download attachment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; attachmentId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, attachmentId } = await params;

    const attachment = await prisma.documentAttachment.findFirst({
      where: { id: attachmentId, contractId: id },
    });

    if (!attachment) {
      return NextResponse.json(
        { error: "Attachment not found" },
        { status: 404 }
      );
    }

    await deleteFile(attachment.filePath);
    await prisma.documentAttachment.delete({
      where: { id: attachmentId },
    });

    return NextResponse.json({ message: "Attachment deleted successfully" });
  } catch (error) {
    console.error("Error deleting attachment:", error);
    return NextResponse.json(
      { error: "Failed to delete attachment" },
      { status: 500 }
    );
  }
}
