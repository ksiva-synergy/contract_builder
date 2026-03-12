import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { saveFile } from "@/lib/file-storage";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    const results: Array<{
      fileName: string;
      filePath: string;
      fileSize: number;
    }> = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await saveFile(buffer, file.name, "bulk-uploads");
      results.push({
        fileName: result.fileName,
        filePath: result.filePath,
        fileSize: result.fileSize,
      });
    }

    return NextResponse.json(results, { status: 201 });
  } catch (error) {
    console.error("Error in bulk upload:", error);
    return NextResponse.json(
      { error: "Failed to process bulk upload" },
      { status: 500 }
    );
  }
}
